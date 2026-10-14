-- Fase 1: detalle del precio, pagos (contado o cuotas) e historial de estados.

-- ===== ES_DEMO HEREDADO DE LA ORDEN =====
-- Las tablas hijas de ordenes no usan enforce_es_demo_flag (que mira el rol):
-- copian es_demo de su orden. Así el demo no puede colgar filas de una orden
-- real (la fila saldría es_demo = false y su política la rechaza), y las filas
-- que crea el link público o esta migración quedan bien marcadas.

create or replace function public.heredar_es_demo_de_orden()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  select es_demo into new.es_demo from public.ordenes where id = new.orden_id;
  return new;
end;
$$;

revoke execute on function public.heredar_es_demo_de_orden() from public, anon, authenticated;

-- ===== ÍTEMS DE LA COTIZACIÓN =====

create table public.orden_items (
  id bigint generated always as identity primary key,
  orden_id bigint not null references public.ordenes(id) on delete cascade,
  tipo text not null check (tipo in ('repuesto', 'mano_obra', 'otro')),
  descripcion text not null,
  cantidad numeric(10, 2) not null default 1 check (cantidad > 0),
  precio_unitario numeric(12, 2) not null check (precio_unitario >= 0),
  -- opcional: lo que le costó al taller. El cliente nunca lo ve.
  costo_unitario numeric(12, 2) check (costo_unitario >= 0),
  subtotal numeric(12, 2) generated always as (cantidad * precio_unitario) stored,
  es_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_orden_items_orden_id on public.orden_items (orden_id);

create trigger trg_orden_items_es_demo
  before insert or update on public.orden_items
  for each row execute function public.heredar_es_demo_de_orden();

-- ===== PAGOS =====
-- De contado es un solo pago; en cuotas, varios abonos hasta saldar.

create table public.pagos (
  id bigint generated always as identity primary key,
  orden_id bigint not null references public.ordenes(id) on delete cascade,
  monto numeric(12, 2) not null check (monto > 0),
  metodo text not null check (metodo in ('efectivo', 'sinpe', 'transferencia')),
  nota text,
  pagado_en timestamptz not null default now(),
  es_demo boolean not null default false
);

create index idx_pagos_orden_id on public.pagos (orden_id);
create index idx_pagos_pagado_en on public.pagos (pagado_en);

create trigger trg_pagos_es_demo
  before insert or update on public.pagos
  for each row execute function public.heredar_es_demo_de_orden();

-- ===== HISTORIAL DE ESTADOS =====
-- Lo llena solo un trigger. cambiado_por nulo = lo cambió el cliente por el link.

create table public.orden_estados_historial (
  id bigint generated always as identity primary key,
  orden_id bigint not null references public.ordenes(id) on delete cascade,
  estado text not null,
  cambiado_por uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  es_demo boolean not null default false
);

create index idx_historial_orden_id on public.orden_estados_historial (orden_id);
create index idx_historial_cambiado_por on public.orden_estados_historial (cambiado_por);

create trigger trg_historial_es_demo
  before insert or update on public.orden_estados_historial
  for each row execute function public.heredar_es_demo_de_orden();

create or replace function public.registrar_cambio_estado()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if TG_OP = 'INSERT' or new.estado is distinct from old.estado then
    insert into public.orden_estados_historial (orden_id, estado, cambiado_por)
    values (new.id, new.estado, auth.uid());
  end if;
  return new;
end;
$$;

revoke execute on function public.registrar_cambio_estado() from public, anon, authenticated;

create trigger trg_ordenes_historial
  after insert or update of estado on public.ordenes
  for each row execute function public.registrar_cambio_estado();

-- ===== RLS =====
-- Igual que las demás tablas: admin ve lo real, demo ve lo demo. El historial
-- solo se lee; lo escribe el trigger.

alter table public.orden_items enable row level security;
alter table public.pagos enable row level security;
alter table public.orden_estados_historial enable row level security;

create policy orden_items_select on public.orden_items for select to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_items_insert on public.orden_items for insert to authenticated
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_items_update on public.orden_items for update to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true))
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_items_delete on public.orden_items for delete to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));

create policy pagos_select on public.pagos for select to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy pagos_insert on public.pagos for insert to authenticated
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy pagos_update on public.pagos for update to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true))
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy pagos_delete on public.pagos for delete to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));

create policy historial_select on public.orden_estados_historial for select to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));

-- ===== DATOS VIEJOS =====
-- Los costos de antes pasan a un ítem. costo_final = 0 se tomaba como "no se
-- sabe", así que en ese caso vale el estimado.

insert into public.orden_items (orden_id, tipo, descripcion, precio_unitario)
select id, 'otro', 'Trabajo registrado antes del sistema nuevo',
       coalesce(nullif(costo_final, 0), costo_estimado)
from public.ordenes
where coalesce(nullif(costo_final, 0), costo_estimado) > 0;

-- Los entregados viejos se toman como pagados de contado.
insert into public.pagos (orden_id, monto, metodo, nota, pagado_en)
select o.id, i.precio_unitario, 'efectivo', 'Pago registrado antes del sistema nuevo', o.fecha_entrega
from public.ordenes o
join public.orden_items i on i.orden_id = o.id
where o.estado = 'entregado';

update public.ordenes set modalidad_pago = 'contado' where estado = 'entregado';

-- Los que ya pasaron de la cotización se dan por aprobados.
update public.ordenes set aprobada = true
where estado in ('esperando_repuestos', 'en_reparacion', 'listo', 'entregado');

-- Un primer paso en el historial para cada orden que ya existía.
insert into public.orden_estados_historial (orden_id, estado, created_at)
select id, estado, fecha_ingreso from public.ordenes;

alter table public.ordenes
  drop column costo_estimado,
  drop column costo_final;

-- ===== TOTALES POR ORDEN =====
-- Si el cliente no aprobó, solo se cobra la revisión (si se cobra).
-- costo_completo = false si algún repuesto no tiene costo: la ganancia es aproximada.

create view public.ordenes_totales
with (security_invoker = true) as
select
  o.id as orden_id,
  o.es_demo,
  t.total,
  coalesce(p.pagado, 0) as pagado,
  t.total - coalesce(p.pagado, 0) as saldo,
  t.costo_repuestos,
  t.costo_completo
from public.ordenes o
left join lateral (
  select
    sum(subtotal) as subtotal,
    sum(cantidad * costo_unitario) filter (where tipo = 'repuesto') as costo_repuestos,
    bool_and(costo_unitario is not null) filter (where tipo = 'repuesto') as costo_completo
  from public.orden_items
  where orden_id = o.id
) i on true
left join lateral (
  select sum(monto) as pagado from public.pagos where orden_id = o.id
) p on true
cross join lateral (
  select
    case when o.aprobada is false then coalesce(o.cobro_revision, 0)
         else coalesce(i.subtotal, 0) end as total,
    case when o.aprobada is false then 0
         else coalesce(i.costo_repuestos, 0) end as costo_repuestos,
    o.aprobada is false or coalesce(i.costo_completo, true) as costo_completo
) t;
