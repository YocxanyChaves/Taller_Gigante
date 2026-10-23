-- Cinco cosas que pidió el taller:
--   1. Tipo de motor del carro.
--   2. Kilómetros o millas: cada carro dice qué marca su tablero, y cada
--      lectura guarda en qué unidad se anotó (por si algún día cambia).
--   3. Videos además de fotos, en el mismo depósito `fotos`.
--   4. Anotar una visita que ya pasó («ya vino y se fue»), solo para el
--      historial: el trabajo nace entregado, con su fecha.
--   5. Fecha del próximo pago cuando se paga en cuotas.

-- ===== 1 y 2. DATOS DEL CARRO Y LECTURAS =====

alter table public.vehiculos
  add column tipo_motor text check (char_length(tipo_motor) <= 60),
  add column unidad_distancia text not null default 'km' check (unidad_distancia in ('km', 'mi'));

alter table public.ordenes
  add column unidad_distancia text not null default 'km' check (unidad_distancia in ('km', 'mi')),
  add column fecha_proximo_pago date;

-- ===== 3. VIDEOS =====
-- Las fotos se achican en el celular (~250 KB); los videos no se pueden
-- achicar ahí, así que el límite del depósito sube a 50 MB (el máximo del
-- plan gratis) y se permiten máximo 3 videos por trabajo.

alter table public.orden_fotos
  add column tipo text not null default 'foto' check (tipo in ('foto', 'video'));

update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/jpeg', 'video/mp4', 'video/quicktime', 'video/webm']
where id = 'fotos';

create or replace function public.limitar_fotos_por_orden()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if (select count(*) from public.orden_fotos where orden_id = new.orden_id) >= 12 then
    raise exception 'Este trabajo ya tiene 12 fotos y videos, que es el máximo. Borre alguno para agregar otro.';
  end if;
  if new.tipo = 'video'
     and (select count(*) from public.orden_fotos where orden_id = new.orden_id and tipo = 'video') >= 3 then
    raise exception 'Este trabajo ya tiene 3 videos, que es el máximo. Borre alguno para agregar otro.';
  end if;
  return new;
end;
$$;

-- ===== 4. UN TRABAJO PUEDE NACER ENTREGADO (visita que ya pasó) =====

create or replace function public.validar_cambio_estado()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
  v_pasos constant text[] := array[
    'cita>en_revision',
    'en_revision>esperando_aprobacion',
    'esperando_aprobacion>esperando_repuestos',
    'esperando_aprobacion>en_reparacion',
    'esperando_aprobacion>no_aprobado',
    'esperando_repuestos>en_reparacion',
    'en_reparacion>listo',
    'listo>entregado',
    'no_aprobado>entregado'
  ];
begin
  if TG_OP = 'INSERT' then
    -- Una visita que ya pasó se anota directo como entregada, con su fecha.
    if new.estado = 'entregado' then
      new.fecha_entrega := coalesce(new.fecha_entrega, new.fecha_ingreso, now());
      return new;
    end if;
    if new.estado not in ('cita', 'en_revision') then
      raise exception 'Un trabajo nuevo empieza como cita o en revisión.';
    end if;
    return new;
  end if;

  if new.estado is not distinct from old.estado then
    return new;
  end if;

  if not (
    (old.estado || '>' || new.estado) = any (v_pasos)
    or (new.estado || '>' || old.estado) = any (v_pasos)
    or (new.estado = 'cancelado' and old.estado not in ('entregado', 'cancelado'))
  ) then
    raise exception 'No se puede pasar de «%» a «%».',
      public.etiqueta_estado(old.estado), public.etiqueta_estado(new.estado);
  end if;

  if old.estado = 'esperando_aprobacion' and new.estado in ('esperando_repuestos', 'en_reparacion') then
    new.aprobada := true;
    new.respondida_en := coalesce(new.respondida_en, now());
  elsif old.estado = 'esperando_aprobacion' and new.estado = 'no_aprobado' then
    new.aprobada := false;
    new.respondida_en := coalesce(new.respondida_en, now());
  elsif new.estado = 'esperando_aprobacion' then
    -- se volvió a mandar el precio: la respuesta anterior ya no vale
    new.aprobada := null;
    new.respondida_en := null;
    new.comentario_cliente := null;
  end if;

  if new.estado = 'entregado' then
    new.fecha_entrega := coalesce(new.fecha_entrega, now());
  elsif old.estado = 'entregado' then
    new.fecha_entrega := null;
  end if;

  return new;
end;
$$;

-- En el historial, la visita pasada queda con su fecha y no con la de hoy.
create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if TG_OP = 'INSERT' or new.estado is distinct from old.estado then
    insert into public.orden_estados_historial (orden_id, estado, cambiado_por, created_at)
    values (
      new.id,
      new.estado,
      auth.uid(),
      case when TG_OP = 'INSERT' and new.estado = 'entregado' then coalesce(new.fecha_entrega, now()) else now() end
    );
  end if;
  return new;
end;
$$;

-- ===== CLIENTE Y CARRO (lo comparten recibir_carro y anotar_visita_pasada) =====
-- Crea el cliente y el carro si son nuevos y devuelve el id del carro. Si el
-- carro ya existe y no tiene motor anotado, le pone el que venga; si viene la
-- unidad del tablero, la actualiza.

create or replace function public.preparar_carro(
  p_vehiculo_id bigint,
  p_placa text,
  p_marca text,
  p_modelo text,
  p_anio integer,
  p_tipo_motor text,
  p_unidad text,
  p_cliente_id bigint,
  p_cliente_nombre text,
  p_cliente_telefono text
)
returns bigint
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_vehiculo_id bigint := p_vehiculo_id;
  v_cliente_id bigint := p_cliente_id;
  v_dueno bigint;
begin
  if p_unidad is not null and p_unidad not in ('km', 'mi') then
    raise exception 'La unidad tiene que ser km o millas.';
  end if;

  -- Cliente nuevo: nombre y teléfono de 8 números.
  if v_cliente_id is null and coalesce(trim(p_cliente_nombre), '') <> '' then
    if length(public.normalizar_telefono(p_cliente_telefono)) <> 8 then
      raise exception 'El teléfono tiene que tener 8 números.';
    end if;
    insert into public.clientes (nombre, telefono)
    values (trim(p_cliente_nombre), public.normalizar_telefono(p_cliente_telefono))
    returning id into v_cliente_id;
  end if;

  if v_vehiculo_id is null then
    if public.normalizar_placa(p_placa) = '' then
      raise exception 'Falta la placa del carro.';
    end if;
    if v_cliente_id is null then
      raise exception 'Falta el cliente dueño del carro.';
    end if;
    insert into public.vehiculos (id_cliente, placa, marca, modelo, anio, tipo_motor, unidad_distancia)
    values (
      v_cliente_id,
      upper(trim(p_placa)),
      nullif(trim(p_marca), ''),
      nullif(trim(p_modelo), ''),
      p_anio,
      nullif(trim(p_tipo_motor), ''),
      coalesce(p_unidad, 'km')
    )
    returning id into v_vehiculo_id;
  else
    select id_cliente into v_dueno from public.vehiculos where id = v_vehiculo_id;
    if not found then
      raise exception 'No se encontró el carro.';
    end if;
    update public.vehiculos
    set id_cliente = coalesce(id_cliente, v_cliente_id),
        tipo_motor = coalesce(tipo_motor, nullif(trim(p_tipo_motor), '')),
        unidad_distancia = coalesce(p_unidad, unidad_distancia)
    where id = v_vehiculo_id;
  end if;

  return v_vehiculo_id;
end;
$$;

-- ===== RECIBIR UN CARRO (ahora con motor y unidad) =====

drop function public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text, integer, text, text);

create or replace function public.recibir_carro(
  p_problema text,
  p_ya_esta boolean,
  p_fecha_cita timestamptz default null,
  p_vehiculo_id bigint default null,
  p_placa text default null,
  p_marca text default null,
  p_modelo text default null,
  p_anio integer default null,
  p_cliente_id bigint default null,
  p_cliente_nombre text default null,
  p_cliente_telefono text default null,
  p_km integer default null,
  p_combustible text default null,
  p_notas text default null,
  p_tipo_motor text default null,
  p_unidad text default null
)
returns bigint
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_vehiculo_id bigint;
  v_unidad text;
  v_orden_id bigint;
begin
  if coalesce(trim(p_problema), '') = '' then
    raise exception 'Falta anotar qué le pasa al carro.';
  end if;

  if not p_ya_esta and p_fecha_cita is null then
    raise exception 'Falta el día de la cita.';
  end if;

  v_vehiculo_id := public.preparar_carro(
    p_vehiculo_id, p_placa, p_marca, p_modelo, p_anio, p_tipo_motor,
    case when p_ya_esta then p_unidad end,
    p_cliente_id, p_cliente_nombre, p_cliente_telefono
  );

  if exists (
    select 1 from public.ordenes
    where id_vehiculo = v_vehiculo_id and estado not in ('entregado', 'cancelado')
  ) then
    raise exception 'Este carro ya está en el taller. Búsquelo en «Carros en el taller».';
  end if;

  select unidad_distancia into v_unidad from public.vehiculos where id = v_vehiculo_id;

  insert into public.ordenes (
    id_vehiculo, problema_reportado, estado, fecha_cita,
    km_entrada, unidad_distancia, nivel_combustible, notas_recepcion
  )
  values (
    v_vehiculo_id,
    trim(p_problema),
    case when p_ya_esta then 'en_revision' else 'cita' end,
    case when p_ya_esta then null else p_fecha_cita end,
    case when p_ya_esta then p_km end,
    v_unidad,
    case when p_ya_esta then p_combustible end,
    case when p_ya_esta then nullif(trim(p_notas), '') end
  )
  returning id into v_orden_id;

  if p_ya_esta and p_km is not null then
    update public.vehiculos
    set kilometraje = p_km
    where id = v_vehiculo_id and coalesce(kilometraje, 0) < p_km;
  end if;

  return v_orden_id;
end;
$$;

-- ===== ANOTAR UNA VISITA QUE YA PASÓ =====
-- El carro vino, se arregló y se fue: se anota solo para el historial. Queda
-- entregado con la fecha de la visita, el kilometraje de ese día y, si se
-- cobró, un solo renglón con el monto. Si ya pagó, el pago queda con la fecha
-- de la visita; si no, queda debiendo (sale en «Quién debe»). No importa si
-- el carro está en el taller ahora mismo.

create or replace function public.anotar_visita_pasada(
  p_fecha timestamptz,
  p_trabajo text,
  p_vehiculo_id bigint default null,
  p_placa text default null,
  p_marca text default null,
  p_modelo text default null,
  p_anio integer default null,
  p_tipo_motor text default null,
  p_cliente_id bigint default null,
  p_cliente_nombre text default null,
  p_cliente_telefono text default null,
  p_km integer default null,
  p_unidad text default null,
  p_monto numeric default 0,
  p_pagado boolean default true,
  p_metodo text default null,
  p_proximo_pago date default null
)
returns bigint
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_vehiculo_id bigint;
  v_unidad text;
  v_orden_id bigint;
  v_monto numeric := coalesce(p_monto, 0);
begin
  if coalesce(trim(p_trabajo), '') = '' then
    raise exception 'Falta anotar qué se le hizo al carro.';
  end if;
  if p_fecha is null then
    raise exception 'Falta el día en que vino.';
  end if;
  if p_fecha > now() + interval '1 day' then
    raise exception 'El día en que vino no puede ser en el futuro.';
  end if;
  if v_monto < 0 then
    raise exception 'El monto no puede ser negativo.';
  end if;
  if v_monto > 0 and p_pagado and p_metodo is null then
    raise exception 'Escoja cómo pagó: efectivo, SINPE o transferencia.';
  end if;

  v_vehiculo_id := public.preparar_carro(
    p_vehiculo_id, p_placa, p_marca, p_modelo, p_anio, p_tipo_motor, p_unidad,
    p_cliente_id, p_cliente_nombre, p_cliente_telefono
  );

  select unidad_distancia into v_unidad from public.vehiculos where id = v_vehiculo_id;

  insert into public.ordenes (
    id_vehiculo, problema_reportado, diagnostico, estado, fecha_ingreso, fecha_entrega,
    km_entrada, unidad_distancia, aprobada, modalidad_pago, fecha_proximo_pago
  )
  values (
    v_vehiculo_id,
    trim(p_trabajo),
    trim(p_trabajo),
    'entregado',
    p_fecha,
    p_fecha,
    p_km,
    v_unidad,
    true,
    case when v_monto > 0 then case when p_pagado then 'contado' else 'cuotas' end end,
    case when v_monto > 0 and not p_pagado then p_proximo_pago end
  )
  returning id into v_orden_id;

  if v_monto > 0 then
    insert into public.orden_items (orden_id, tipo, descripcion, cantidad, precio_unitario)
    values (v_orden_id, 'otro', 'Lo que se cobró', 1, v_monto);
    if p_pagado then
      insert into public.pagos (orden_id, monto, metodo, pagado_en)
      values (v_orden_id, v_monto, p_metodo, p_fecha);
    end if;
  end if;

  if p_km is not null then
    update public.vehiculos
    set kilometraje = p_km
    where id = v_vehiculo_id and coalesce(kilometraje, 0) < p_km;
  end if;

  return v_orden_id;
end;
$$;

-- ===== 5. PRÓXIMO PAGO =====

drop function public.entregar_trabajo(bigint, text, numeric, text, numeric, text);

create or replace function public.entregar_trabajo(
  p_orden_id bigint,
  p_modalidad text default null,
  p_monto numeric default 0,
  p_metodo text default null,
  p_cobro_revision numeric default null,
  p_nota text default null,
  p_proximo_pago date default null
)
returns numeric
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_estado text;
  v_saldo numeric;
  v_monto numeric := coalesce(p_monto, 0);
begin
  select estado into v_estado from public.ordenes where id = p_orden_id for update;
  if v_estado is null then
    raise exception 'No se encontró el trabajo.';
  end if;

  if v_monto < 0 then
    raise exception 'El monto no puede ser negativo.';
  end if;

  if v_estado = 'listo' then
    if p_modalidad is null or p_modalidad not in ('contado', 'cuotas') then
      raise exception 'Escoja si paga todo ahora o en cuotas.';
    end if;
    update public.ordenes set modalidad_pago = p_modalidad where id = p_orden_id;
  elsif v_estado = 'no_aprobado' then
    if coalesce(p_cobro_revision, 0) < 0 then
      raise exception 'El cobro de la revisión no puede ser negativo.';
    end if;
    update public.ordenes
    set cobro_revision = nullif(p_cobro_revision, 0),
        modalidad_pago = case when coalesce(p_cobro_revision, 0) > 0
                              then coalesce(p_modalidad, 'contado') end
    where id = p_orden_id;
  else
    raise exception 'Este carro todavía no se puede entregar.';
  end if;

  select saldo into v_saldo from public.ordenes_totales where orden_id = p_orden_id;

  if v_monto > v_saldo then
    raise exception 'El pago es mayor que el total (₡%).', replace(to_char(v_saldo, 'FM999G999G990'), ',', ' ');
  end if;
  if p_modalidad = 'contado' and v_monto < v_saldo then
    raise exception 'De contado se paga todo: ₡%.', replace(to_char(v_saldo, 'FM999G999G990'), ',', ' ');
  end if;

  if v_monto > 0 then
    if p_metodo is null then
      raise exception 'Escoja cómo pagó: efectivo, SINPE o transferencia.';
    end if;
    insert into public.pagos (orden_id, monto, metodo, nota)
    values (p_orden_id, v_monto, p_metodo, nullif(trim(p_nota), ''));
  end if;

  update public.ordenes
  set estado = 'entregado',
      fecha_proximo_pago = case when v_saldo - v_monto > 0 then p_proximo_pago end
  where id = p_orden_id;

  return v_saldo - v_monto;
end;
$$;

drop function public.registrar_abono(bigint, numeric, text, text);

create or replace function public.registrar_abono(
  p_orden_id bigint,
  p_monto numeric,
  p_metodo text,
  p_nota text default null,
  p_proximo_pago date default null
)
returns numeric
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_estado text;
  v_saldo numeric;
begin
  select estado into v_estado from public.ordenes where id = p_orden_id for update;
  if v_estado is null then
    raise exception 'No se encontró el trabajo.';
  end if;
  if v_estado <> 'entregado' then
    raise exception 'Los abonos se anotan después de entregar el carro.';
  end if;
  if coalesce(p_monto, 0) <= 0 then
    raise exception 'Escriba cuánto pagó.';
  end if;
  if p_metodo is null then
    raise exception 'Escoja cómo pagó: efectivo, SINPE o transferencia.';
  end if;

  select saldo into v_saldo from public.ordenes_totales where orden_id = p_orden_id;
  if v_saldo <= 0 then
    raise exception 'Este trabajo ya está pagado.';
  end if;
  if p_monto > v_saldo then
    raise exception 'El abono es mayor que lo que debe (₡%).', replace(to_char(v_saldo, 'FM999G999G990'), ',', ' ');
  end if;

  insert into public.pagos (orden_id, monto, metodo, nota)
  values (p_orden_id, p_monto, p_metodo, nullif(trim(p_nota), ''));

  update public.ordenes
  set fecha_proximo_pago = case when v_saldo - p_monto > 0 then p_proximo_pago end
  where id = p_orden_id;

  return v_saldo - p_monto;
end;
$$;

-- «Quién debe», ahora con el próximo pago: primero los que ya les tocaba
-- pagar (o les toca pronto), después los que no tienen fecha.
drop function public.lista_cobros();

create or replace function public.lista_cobros()
returns table (
  orden_id bigint,
  cliente_id bigint,
  cliente_nombre text,
  cliente_telefono text,
  placa text,
  marca text,
  modelo text,
  total numeric,
  saldo numeric,
  fecha_entrega timestamptz,
  ultimo_abono timestamptz,
  token_publico uuid,
  fecha_proximo_pago date
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select o.id, c.id, c.nombre, c.telefono, v.placa, v.marca, v.modelo,
         t.total, t.saldo, o.fecha_entrega,
         (select max(p.pagado_en) from public.pagos p where p.orden_id = o.id),
         o.token_publico, o.fecha_proximo_pago
  from public.ordenes o
  join public.ordenes_totales t on t.orden_id = o.id
  join public.vehiculos v on v.id = o.id_vehiculo
  left join public.clientes c on c.id = v.id_cliente
  where o.estado = 'entregado' and t.saldo > 0
  order by o.fecha_proximo_pago nulls last, o.fecha_entrega nulls first, o.id;
$$;

-- La búsqueda por placa también dice el motor y si marca km o millas.
drop function public.buscar_vehiculo_por_placa(text);

create or replace function public.buscar_vehiculo_por_placa(p_placa text)
returns table (
  id bigint, placa text, marca text, modelo text, anio integer,
  cliente_id bigint, cliente_nombre text, cliente_telefono text, trabajo_activo_id bigint,
  tipo_motor text, unidad_distancia text
)
language sql
stable
set search_path to 'public'
as $$
  select v.id, v.placa, v.marca, v.modelo, v.anio,
         c.id, c.nombre, c.telefono,
         (select o.id from public.ordenes o
          where o.id_vehiculo = v.id and o.estado not in ('entregado', 'cancelado')
          order by o.fecha_ingreso desc limit 1),
         v.tipo_motor, v.unidad_distancia
  from public.vehiculos v
  left join public.clientes c on c.id = v.id_cliente
  where public.normalizar_placa(v.placa) = public.normalizar_placa(p_placa)
    and public.normalizar_placa(p_placa) <> ''
  order by v.id desc
  limit 1;
$$;

-- ===== PERMISOS =====

revoke execute on function
  public.preparar_carro(bigint, text, text, text, integer, text, text, bigint, text, text),
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text, integer, text, text, text, text),
  public.anotar_visita_pasada(timestamptz, text, bigint, text, text, text, integer, text, bigint, text, text, integer, text, numeric, boolean, text, date),
  public.entregar_trabajo(bigint, text, numeric, text, numeric, text, date),
  public.registrar_abono(bigint, numeric, text, text, date),
  public.lista_cobros(),
  public.buscar_vehiculo_por_placa(text)
from public, anon, authenticated;

grant execute on function
  public.preparar_carro(bigint, text, text, text, integer, text, text, bigint, text, text),
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text, integer, text, text, text, text),
  public.anotar_visita_pasada(timestamptz, text, bigint, text, text, text, integer, text, bigint, text, text, integer, text, numeric, boolean, text, date),
  public.entregar_trabajo(bigint, text, numeric, text, numeric, text, date),
  public.registrar_abono(bigint, numeric, text, text, date),
  public.lista_cobros(),
  public.buscar_vehiculo_por_placa(text)
to authenticated;
