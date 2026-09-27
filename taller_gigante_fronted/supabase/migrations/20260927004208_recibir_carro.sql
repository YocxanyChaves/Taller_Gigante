-- Fase 3: recibir un carro.
--
-- El asistente "Recibir un carro" busca la placa y el teléfono tal como los
-- escribe el tío ("dsf 456", "8888-1111") y guarda cliente, carro y trabajo
-- de una sola vez: si algo falla, no queda nada a medias. Todas corren con
-- los permisos de quien llama (RLS y es_demo aplican como siempre).

-- ===== NORMALIZAR =====

-- "dsf-456", "DSF 456" → "DSF456" (misma regla que el índice vehiculos_placa_unica).
create or replace function public.normalizar_placa(p_placa text)
returns text
language sql
immutable
set search_path to ''
as $$
  select upper(regexp_replace(coalesce(p_placa, ''), '[^A-Za-z0-9]', '', 'g'));
$$;

-- "8888-1111", "+506 8888 1111" → "88881111" (los últimos 8 dígitos).
create or replace function public.normalizar_telefono(p_telefono text)
returns text
language sql
immutable
set search_path to ''
as $$
  select right(regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g'), 8);
$$;

-- ===== BUSCAR =====

-- El carro con esa placa (y su dueño, si tiene), más si ya está en el taller.
create or replace function public.buscar_vehiculo_por_placa(p_placa text)
returns table (
  id bigint,
  placa text,
  marca text,
  modelo text,
  anio integer,
  cliente_id bigint,
  cliente_nombre text,
  cliente_telefono text,
  trabajo_activo_id bigint
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select v.id, v.placa, v.marca, v.modelo, v.anio,
         c.id, c.nombre, c.telefono,
         (select o.id from public.ordenes o
          where o.id_vehiculo = v.id and o.estado not in ('entregado', 'cancelado')
          order by o.fecha_ingreso desc limit 1)
  from public.vehiculos v
  left join public.clientes c on c.id = v.id_cliente
  where public.normalizar_placa(v.placa) = public.normalizar_placa(p_placa)
    and public.normalizar_placa(p_placa) <> ''
  order by v.id desc
  limit 1;
$$;

-- Clientes con ese teléfono (puede haber más de uno con el mismo número).
create or replace function public.buscar_cliente_por_telefono(p_telefono text)
returns table (id bigint, nombre text, telefono text)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select c.id, c.nombre, c.telefono
  from public.clientes c
  where public.normalizar_telefono(c.telefono) = public.normalizar_telefono(p_telefono)
    and length(public.normalizar_telefono(p_telefono)) = 8
  order by c.fecha_ingreso desc;
$$;

-- ===== RECIBIR UN CARRO =====
-- Casos:
--   · carro conocido (p_vehiculo_id): solo se crea el trabajo; si el carro no
--     tenía dueño y viene un cliente, se le asigna.
--   · carro nuevo: se crea con la placa y los datos opcionales, del cliente
--     elegido (p_cliente_id) o de uno nuevo (p_cliente_nombre + teléfono).
-- "Ya está aquí" (p_ya_esta) crea el trabajo en revisión; si no, como cita.
-- Devuelve el id del trabajo nuevo.

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
  p_cliente_telefono text default null
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
  v_orden_id bigint;
begin
  if coalesce(trim(p_problema), '') = '' then
    raise exception 'Falta anotar qué le pasa al carro.';
  end if;

  if not p_ya_esta and p_fecha_cita is null then
    raise exception 'Falta el día de la cita.';
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
    insert into public.vehiculos (id_cliente, placa, marca, modelo, anio)
    values (
      v_cliente_id,
      upper(trim(p_placa)),
      nullif(trim(p_marca), ''),
      nullif(trim(p_modelo), ''),
      p_anio
    )
    returning id into v_vehiculo_id;
  else
    select id_cliente into v_dueno from public.vehiculos where id = v_vehiculo_id;
    if not found then
      raise exception 'No se encontró el carro.';
    end if;
    if v_dueno is null and v_cliente_id is not null then
      update public.vehiculos set id_cliente = v_cliente_id where id = v_vehiculo_id;
    end if;
  end if;

  if exists (
    select 1 from public.ordenes
    where id_vehiculo = v_vehiculo_id and estado not in ('entregado', 'cancelado')
  ) then
    raise exception 'Este carro ya está en el taller. Búsquelo en «Carros en el taller».';
  end if;

  insert into public.ordenes (id_vehiculo, problema_reportado, estado, fecha_cita)
  values (
    v_vehiculo_id,
    trim(p_problema),
    case when p_ya_esta then 'en_revision' else 'cita' end,
    case when p_ya_esta then null else p_fecha_cita end
  )
  returning id into v_orden_id;

  return v_orden_id;
end;
$$;

-- ===== PERMISOS =====

revoke execute on function
  public.normalizar_placa(text),
  public.normalizar_telefono(text),
  public.buscar_vehiculo_por_placa(text),
  public.buscar_cliente_por_telefono(text),
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text)
from public, anon, authenticated;

grant execute on function
  public.normalizar_placa(text),
  public.normalizar_telefono(text),
  public.buscar_vehiculo_por_placa(text),
  public.buscar_cliente_por_telefono(text),
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text)
to authenticated;
