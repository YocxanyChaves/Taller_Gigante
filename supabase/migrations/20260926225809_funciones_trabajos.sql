-- Fase 1: reglas del flujo, link público del cliente y cálculos del dashboard.

-- ===== NOMBRE DE CADA ESTADO =====
-- El mismo texto que ve el tío en pantalla (para los mensajes de error).

create or replace function public.etiqueta_estado(p_estado text)
returns text
language sql
immutable
set search_path to ''
as $$
  select case p_estado
    when 'cita'                 then 'Cita agendada'
    when 'en_revision'          then 'En revisión'
    when 'esperando_aprobacion' then 'Esperando respuesta del cliente'
    when 'no_aprobado'          then 'No aprobó'
    when 'esperando_repuestos'  then 'Esperando repuestos'
    when 'en_reparacion'        then 'En reparación'
    when 'listo'                then 'Listo para recoger'
    when 'entregado'            then 'Entregado'
    when 'cancelado'            then 'Cancelado'
    else p_estado
  end;
$$;

-- ===== PASOS PERMITIDOS =====
-- Vale cualquier camino, no solo avanzar_estado(): el link público, el
-- frontend o un update directo pasan por aquí. Se puede retroceder un paso para
-- corregir (el frontend pide confirmación) y cancelar mientras no se entregue.
-- De paso llena la respuesta del cliente y la fecha de entrega.

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

revoke execute on function public.validar_cambio_estado() from public, anon, authenticated;

create trigger trg_validar_cambio_estado
  before insert or update of estado on public.ordenes
  for each row execute function public.validar_cambio_estado();

-- ===== AVANZAR ESTADO (frontend) =====
-- Corre con los permisos de quien llama: RLS decide qué trabajos puede tocar.

create or replace function public.avanzar_estado(p_orden_id bigint, p_nuevo_estado text)
returns public.ordenes
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_orden public.ordenes;
begin
  update public.ordenes set estado = p_nuevo_estado
  where id = p_orden_id
  returning * into v_orden;

  if v_orden.id is null then
    raise exception 'No se encontró el trabajo.';
  end if;

  return v_orden;
end;
$$;

-- ===== LINK PÚBLICO: VER EL TRABAJO =====
-- Sin login. Devuelve solo lo que el cliente necesita: nunca teléfono, correo,
-- dirección, costos del taller ni otros trabajos. Token inexistente → null.

create or replace function public.get_trabajo_publico(p_token uuid)
returns json
language sql
stable
security definer
set search_path to 'public'
as $$
  select json_build_object(
    'taller', 'Taller Mecánico Gigante',
    'cliente', nullif(split_part(trim(c.nombre), ' ', 1), ''),
    'carro', json_build_object('marca', v.marca, 'modelo', v.modelo, 'placa', v.placa),
    'estado', o.estado,
    'historial', (
      select json_agg(json_build_object('estado', h.estado, 'fecha', h.created_at) order by h.created_at, h.id)
      from public.orden_estados_historial h
      where h.orden_id = o.id
    ),
    'problema', o.problema_reportado,
    'diagnostico', o.diagnostico,
    'fecha_cita', o.fecha_cita,
    'fecha_ingreso', o.fecha_ingreso,
    'fecha_entrega', o.fecha_entrega,
    'items', (
      select json_agg(json_build_object(
        'tipo', i.tipo,
        'descripcion', i.descripcion,
        'cantidad', i.cantidad,
        'precio_unitario', i.precio_unitario,
        'subtotal', i.subtotal
      ) order by i.id)
      from public.orden_items i
      where i.orden_id = o.id
    ),
    'aprobada', o.aprobada,
    'cobro_revision', o.cobro_revision,
    'total', t.total,
    'pagado', t.pagado,
    'saldo', t.saldo,
    'puede_responder', o.estado = 'esperando_aprobacion'
  )
  from public.ordenes o
  join public.vehiculos v on v.id = o.id_vehiculo
  left join public.clientes c on c.id = v.id_cliente
  join public.ordenes_totales t on t.orden_id = o.id
  where o.token_publico = p_token;
$$;

-- ===== LINK PÚBLICO: APROBAR O RECHAZAR =====
-- Solo cuando el trabajo espera respuesta. Si ya respondió, no cambia nada y
-- devuelve el estado actual (tocar dos veces el botón no hace daño).

create or replace function public.responder_cotizacion(
  p_token uuid,
  p_aprueba boolean,
  p_comentario text default null
)
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_id bigint;
  v_estado text;
begin
  if p_aprueba is null then
    raise exception 'Falta la respuesta: sí o no.';
  end if;

  select id, estado into v_id, v_estado
  from public.ordenes
  where token_publico = p_token
  for update;

  if v_id is null then
    return null;
  end if;

  if v_estado = 'esperando_aprobacion' then
    update public.ordenes
    set comentario_cliente = nullif(left(trim(p_comentario), 500), ''),
        estado = case
          when not p_aprueba then 'no_aprobado'
          when exists (
            select 1 from public.orden_items
            where orden_id = v_id and tipo = 'repuesto'
          ) then 'esperando_repuestos'
          else 'en_reparacion'
        end
    where id = v_id;
  end if;

  return public.get_trabajo_publico(p_token);
end;
$$;

-- ===== REGENERAR EL LINK =====
-- Por si se mandó al número equivocado: el link viejo deja de funcionar.

create or replace function public.regenerar_token(p_orden_id bigint)
returns uuid
language plpgsql
security invoker
set search_path to 'public'
as $$
declare
  v_token uuid;
begin
  update public.ordenes set token_publico = gen_random_uuid()
  where id = p_orden_id
  returning token_publico into v_token;

  if v_token is null then
    raise exception 'No se encontró el trabajo.';
  end if;

  return v_token;
end;
$$;

-- ===== DASHBOARD: PLATA POR MES =====
-- Con los permisos de quien llama, así que admin ve lo real y demo lo demo.
-- Meses en hora de Costa Rica.
--   cobrado:     pagos hechos en el mes
--   por_cobrar:  saldo pendiente hoy de lo entregado en el mes
--   ganancia:    total − costo de repuestos de lo entregado en el mes
--                (aproximada si a algún repuesto le falta el costo)

create or replace function public.resumen_plata(p_desde date, p_hasta date)
returns table (
  mes date,
  cobrado numeric,
  por_cobrar numeric,
  ganancia numeric,
  ganancia_aproximada boolean
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  with meses as (
    select generate_series(
      date_trunc('month', p_desde),
      date_trunc('month', p_hasta),
      interval '1 month'
    )::date as mes
  ),
  cobros as (
    select date_trunc('month', pagado_en at time zone 'America/Costa_Rica')::date as mes,
           sum(monto) as cobrado
    from public.pagos
    group by 1
  ),
  entregas as (
    select date_trunc('month', o.fecha_entrega at time zone 'America/Costa_Rica')::date as mes,
           sum(t.saldo) as por_cobrar,
           sum(t.total - t.costo_repuestos) as ganancia,
           bool_or(not t.costo_completo) as aproximada
    from public.ordenes o
    join public.ordenes_totales t on t.orden_id = o.id
    where o.estado = 'entregado'
    group by 1
  )
  select m.mes,
         coalesce(c.cobrado, 0),
         coalesce(e.por_cobrar, 0),
         coalesce(e.ganancia, 0),
         coalesce(e.aproximada, false)
  from meses m
  left join cobros c using (mes)
  left join entregas e using (mes)
  order by m.mes;
$$;

-- ===== DASHBOARD: TARJETAS DE INICIO =====

create or replace function public.resumen_inicio()
returns json
language sql
stable
security invoker
set search_path to 'public'
as $$
  select json_build_object(
    'en_taller', count(*) filter (where o.estado in (
      'en_revision', 'esperando_aprobacion', 'no_aprobado',
      'esperando_repuestos', 'en_reparacion', 'listo'
    )),
    'esperando_respuesta', count(*) filter (where o.estado = 'esperando_aprobacion'),
    'listos', count(*) filter (where o.estado = 'listo'),
    'por_cobrar', coalesce(sum(t.saldo) filter (where o.estado = 'entregado'), 0)
  )
  from public.ordenes o
  join public.ordenes_totales t on t.orden_id = o.id;
$$;

-- ===== FUNCIONES VIEJAS AL DÍA =====

create or replace function public.get_stats_publicas()
returns json
language sql
stable
security definer
set search_path to 'public'
as $$
  select json_build_object(
    'clientes', (select count(*) from public.clientes where es_demo = false),
    'vehiculos', (select count(*) from public.vehiculos where es_demo = false),
    'ordenes_completadas', (
      select count(*) from public.ordenes
      where es_demo = false and estado = 'entregado'
    )
  );
$$;

-- Ya no borra cuentas de login (los clientes no tienen). Se niega si el
-- cliente tiene carros en el taller.
create or replace function public.eliminar_cliente_completo(p_cliente_id bigint, p_modo text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_rol text := coalesce(public.get_my_role(), '');
  v_es_demo boolean;
  v_activos int;
begin
  select es_demo into v_es_demo from public.clientes where id = p_cliente_id;

  if not found then
    raise exception 'El cliente no existe.';
  end if;

  if (v_es_demo and v_rol <> 'demo') or (not v_es_demo and v_rol <> 'admin') then
    raise exception 'No tiene permiso para eliminar este cliente.';
  end if;

  if p_modo not in ('todo', 'conservar_historial') then
    raise exception 'Modo de eliminación inválido.';
  end if;

  select count(*) into v_activos
  from public.ordenes o
  join public.vehiculos v on v.id = o.id_vehiculo
  where v.id_cliente = p_cliente_id
    and o.estado not in ('entregado', 'cancelado');

  if v_activos > 0 then
    raise exception 'Este cliente tiene % trabajo(s) sin terminar. Entréguelos o cancélelos antes de eliminarlo.', v_activos;
  end if;

  if p_modo = 'todo' then
    delete from public.ordenes where id_vehiculo in (select id from public.vehiculos where id_cliente = p_cliente_id);
    delete from public.vehiculos where id_cliente = p_cliente_id;
  else
    update public.vehiculos set id_cliente = null where id_cliente = p_cliente_id;
  end if;

  delete from public.clientes where id = p_cliente_id;
end;
$$;

-- ===== PERMISOS =====
-- Supabase da EXECUTE a anon por defecto: se quita y se da solo a quien toca.

revoke execute on function
  public.avanzar_estado(bigint, text),
  public.get_trabajo_publico(uuid),
  public.responder_cotizacion(uuid, boolean, text),
  public.regenerar_token(bigint),
  public.resumen_plata(date, date),
  public.resumen_inicio(),
  public.etiqueta_estado(text)
from public, anon, authenticated;

grant execute on function
  public.get_trabajo_publico(uuid),
  public.responder_cotizacion(uuid, boolean, text)
to anon, authenticated;

grant execute on function
  public.avanzar_estado(bigint, text),
  public.regenerar_token(bigint),
  public.resumen_plata(date, date),
  public.resumen_inicio(),
  public.etiqueta_estado(text)
to authenticated;
