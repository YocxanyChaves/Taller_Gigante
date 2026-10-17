-- Fotos de evidencia de cada trabajo: cómo llegó el carro, el repuesto
-- dañado, cómo se entregó. Los archivos van al depósito privado `fotos`
-- (Supabase Storage) en `<orden_id>/<uuid>.jpg`; aquí queda la lista con su
-- nota. El cliente las ve por su link con la función `fotos-cliente`, que da
-- direcciones que vencen en 1 hora.

-- ===== TABLA =====

create table public.orden_fotos (
  id bigint generated always as identity primary key,
  orden_id bigint not null references public.ordenes(id) on delete cascade,
  ruta text not null unique,
  nota text check (char_length(nota) <= 120),
  es_demo boolean not null default false,
  created_at timestamptz not null default now(),
  -- La foto tiene que estar en la carpeta de su trabajo.
  constraint orden_fotos_ruta_de_su_orden check (split_part(ruta, '/', 1) = orden_id::text)
);

create index idx_orden_fotos_orden_id on public.orden_fotos (orden_id);

create trigger trg_orden_fotos_es_demo
  before insert or update on public.orden_fotos
  for each row execute function public.heredar_es_demo_de_orden();

-- Máximo 12 fotos por trabajo, para que el espacio gratis no se llene por accidente.
create or replace function public.limitar_fotos_por_orden()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if (select count(*) from public.orden_fotos where orden_id = new.orden_id) >= 12 then
    raise exception 'Este trabajo ya tiene 12 fotos, que es el máximo. Borre alguna para agregar otra.';
  end if;
  return new;
end;
$$;

revoke execute on function public.limitar_fotos_por_orden() from public, anon, authenticated;

create trigger trg_orden_fotos_limite
  before insert on public.orden_fotos
  for each row execute function public.limitar_fotos_por_orden();

alter table public.orden_fotos enable row level security;

create policy orden_fotos_select on public.orden_fotos for select to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_fotos_insert on public.orden_fotos for insert to authenticated
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_fotos_update on public.orden_fotos for update to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true))
  with check (((select public.get_my_role()) = 'admin' and es_demo = false)
           or ((select public.get_my_role()) = 'demo' and es_demo = true));
create policy orden_fotos_delete on public.orden_fotos for delete to authenticated
  using (((select public.get_my_role()) = 'admin' and es_demo = false)
      or ((select public.get_my_role()) = 'demo' and es_demo = true));

-- ===== DEPÓSITO =====
-- Privado, solo JPG (el navegador las achica antes de subirlas) y 2 MB máximo.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos', 'fotos', false, 2097152, array['image/jpeg']);

-- Si la carpeta es de un trabajo que ve el usuario. ordenes tiene RLS, así que
-- admin solo pasa con trabajos reales y demo con los de prueba.
create or replace function public.puede_usar_foto(p_ruta text)
returns boolean
language sql
stable
set search_path to 'public'
as $$
  select coalesce(public.get_my_role(), '') in ('admin', 'demo')
     and exists (select 1 from public.ordenes o where o.id::text = split_part(p_ruta, '/', 1));
$$;

revoke execute on function public.puede_usar_foto(text) from public, anon;
grant execute on function public.puede_usar_foto(text) to authenticated;

create policy fotos_select on storage.objects for select to authenticated
  using (bucket_id = 'fotos' and public.puede_usar_foto(name));
create policy fotos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and public.puede_usar_foto(name));
create policy fotos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'fotos' and public.puede_usar_foto(name));
