-- Fase 5: entregar, cobrar y abonos.
--
-- Entregar el carro y anotar el primer pago va junto: si algo falla, no queda
-- un carro entregado sin su pago ni un pago de un carro que sigue en el
-- taller. Todas corren con los permisos de quien llama (RLS y es_demo
-- aplican como siempre; un pago hereda es_demo de su trabajo).

-- ===== ENTREGAR Y COBRAR =====
-- Desde `listo`: de contado (paga todo hoy) o en cuotas (abona lo que pueda,
-- hasta nada). Desde `no_aprobado`: se lleva el carro, con un cobro de la
-- revisión opcional. Devuelve el saldo que queda.

create or replace function public.entregar_trabajo(
  p_orden_id bigint,
  p_modalidad text default null,
  p_monto numeric default 0,
  p_metodo text default null,
  p_cobro_revision numeric default null,
  p_nota text default null
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

  update public.ordenes set estado = 'entregado' where id = p_orden_id;

  return v_saldo - v_monto;
end;
$$;

-- ===== ABONOS =====
-- Un abono a un trabajo ya entregado, nunca más de lo que debe. Devuelve el
-- saldo que queda.

create or replace function public.registrar_abono(
  p_orden_id bigint,
  p_monto numeric,
  p_metodo text,
  p_nota text default null
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

  return v_saldo - p_monto;
end;
$$;

-- ===== QUIÉN DEBE =====
-- Trabajos entregados con saldo, del más viejo al más nuevo.

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
  token_publico uuid
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  select o.id, c.id, c.nombre, c.telefono, v.placa, v.marca, v.modelo,
         t.total, t.saldo, o.fecha_entrega,
         (select max(p.pagado_en) from public.pagos p where p.orden_id = o.id),
         o.token_publico
  from public.ordenes o
  join public.ordenes_totales t on t.orden_id = o.id
  join public.vehiculos v on v.id = o.id_vehiculo
  left join public.clientes c on c.id = v.id_cliente
  where o.estado = 'entregado' and t.saldo > 0
  order by o.fecha_entrega nulls first, o.id;
$$;

-- ===== PERMISOS =====

revoke execute on function
  public.entregar_trabajo(bigint, text, numeric, text, numeric, text),
  public.registrar_abono(bigint, numeric, text, text),
  public.lista_cobros()
from public, anon, authenticated;

grant execute on function
  public.entregar_trabajo(bigint, text, numeric, text, numeric, text),
  public.registrar_abono(bigint, numeric, text, text),
  public.lista_cobros()
to authenticated;
