-- Fase 6: buscar un cliente.
--
-- Un solo buscador para nombre, teléfono o placa, escritos como sea
-- ("jose" encuentra a "José", "8888-11" y "btr 482" también sirven). Sin
-- texto devuelve los clientes con movimiento más reciente, para que la
-- pantalla nunca arranque vacía. Corre con los permisos de quien llama
-- (RLS y es_demo aplican como siempre).

-- ===== NORMALIZAR =====

-- "José Ñúñez" → "jose nunez": para comparar nombres sin tildes ni mayúsculas.
create or replace function public.normalizar_nombre(p_nombre text)
returns text
language sql
immutable
set search_path to ''
as $$
  select translate(lower(coalesce(p_nombre, '')), 'áéíóúüñ', 'aeiouun');
$$;

-- ===== BUSCAR =====
-- `debe` es el saldo de los trabajos ya entregados (lo mismo que cuenta
-- "por cobrar"); `en_taller`, los trabajos sin terminar.

create or replace function public.buscar_clientes(p_texto text default null)
returns table (
  id bigint,
  nombre text,
  telefono text,
  placas text[],
  debe numeric,
  en_taller integer,
  ultima_visita timestamptz
)
language sql
stable
security invoker
set search_path to 'public'
as $$
  with criterio as (
    select
      -- Se quitan % y _ para que no funcionen como comodines del like.
      replace(replace(public.normalizar_nombre(trim(coalesce(p_texto, ''))), '%', ''), '_', '') as nombre,
      regexp_replace(coalesce(p_texto, ''), '\D', '', 'g') as digitos,
      public.normalizar_placa(p_texto) as placa
  )
  select
    c.id,
    c.nombre,
    c.telefono,
    coalesce(v.placas, '{}'),
    coalesce(o.debe, 0),
    coalesce(o.en_taller, 0)::integer,
    greatest(c.fecha_ingreso, o.ultima_visita)
  from public.clientes c
  cross join criterio q
  left join lateral (
    select array_agg(upper(vh.placa) order by vh.id) as placas
    from public.vehiculos vh
    where vh.id_cliente = c.id
  ) v on true
  left join lateral (
    select
      sum(t.saldo) filter (where od.estado = 'entregado' and t.saldo > 0) as debe,
      count(*) filter (where od.estado not in ('entregado', 'cancelado')) as en_taller,
      max(od.fecha_ingreso) as ultima_visita
    from public.vehiculos vh
    join public.ordenes od on od.id_vehiculo = vh.id
    join public.ordenes_totales t on t.orden_id = od.id
    where vh.id_cliente = c.id
  ) o on true
  where q.nombre = ''
     or public.normalizar_nombre(c.nombre) like '%' || q.nombre || '%'
     or (length(q.digitos) >= 3
         and regexp_replace(c.telefono, '\D', '', 'g') like '%' || q.digitos || '%')
     or (length(q.placa) >= 2
         and exists (
           select 1 from public.vehiculos vh
           where vh.id_cliente = c.id
             and public.normalizar_placa(vh.placa) like '%' || q.placa || '%'
         ))
  order by
    -- Sin texto: los de movimiento más reciente. Con texto: por nombre.
    case when q.nombre = '' then greatest(c.fecha_ingreso, o.ultima_visita) end desc nulls last,
    public.normalizar_nombre(c.nombre)
  limit case when trim(coalesce(p_texto, '')) = '' then 8 else 30 end;
$$;

-- ===== PERMISOS =====

revoke execute on function
  public.normalizar_nombre(text),
  public.buscar_clientes(text)
from public, anon, authenticated;

grant execute on function
  public.normalizar_nombre(text),
  public.buscar_clientes(text)
to authenticated;
