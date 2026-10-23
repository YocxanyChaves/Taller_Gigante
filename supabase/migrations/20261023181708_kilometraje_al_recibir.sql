-- Kilometraje al recibir un carro que "Ya está aquí".
--
-- recibir_carro recibe p_km (opcional en la base; la pantalla lo pide). Se
-- guarda como km_entrada del trabajo y, si es mayor que el que tenía el
-- carro, también como su kilometraje. Solo aplica si el carro ya está aquí:
-- en una cita el kilometraje se anota cuando llega («Llegó el carro»).
-- Se cambia la firma, así que se borra la anterior y se crea de nuevo.

drop function public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text);

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
  p_km integer default null
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

  insert into public.ordenes (id_vehiculo, problema_reportado, estado, fecha_cita, km_entrada)
  values (
    v_vehiculo_id,
    trim(p_problema),
    case when p_ya_esta then 'en_revision' else 'cita' end,
    case when p_ya_esta then null else p_fecha_cita end,
    case when p_ya_esta then p_km end
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

revoke execute on function
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text, integer)
from public, anon, authenticated;

grant execute on function
  public.recibir_carro(text, boolean, timestamptz, bigint, text, text, text, integer, bigint, text, text, integer)
to authenticated;
