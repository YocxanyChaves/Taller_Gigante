-- Fase 1: los clientes ya no tienen cuenta (plan nuevo, 26/09/2026).
--
-- Solo inician sesión el admin y el demo. El cliente ve su trabajo con un link
-- único (ver 20260926225809_funciones_trabajos.sql). Se quita todo lo que unía
-- una cuenta de login con una ficha de cliente. Confirmado por la dueña; los
-- datos son de prueba y hay respaldo en supabase/respaldos/ (fuera de git).

-- ===== TRIGGERS Y FUNCIONES DE VINCULACIÓN Y BLOQUEO =====

drop trigger if exists trg_bloquear_desvinculacion_cliente on public.clientes;
drop trigger if exists trg_proteger_bloqueo_cliente on public.clientes;
drop trigger if exists trg_proteger_datos_cliente_vinculado on public.clientes;
drop trigger if exists trg_sincronizar_datos_cliente_vinculado on public.clientes;

drop function if exists public.bloquear_desvinculacion_cliente();
drop function if exists public.proteger_bloqueo_cliente();
drop function if exists public.proteger_datos_cliente_vinculado();
drop function if exists public.sincronizar_datos_cliente_vinculado();
drop function if exists public.fusionar_cliente_vinculado(bigint, uuid);

drop table if exists public.solicitudes_vinculacion;

-- ===== CUENTAS DE CLIENTES =====
-- Se borran las cuentas (la fila de usuarios se va en cascada). Las fichas de
-- esos clientes se quedan, con sus carros y órdenes.

delete from auth.users
where id in (select id from public.usuarios where rol = 'cliente');

-- ===== POLÍTICAS SIN EL ROL CLIENTE =====
-- Hay que quitarlas antes que la columna clientes.user_id, porque la usan.

drop policy clientes_select on public.clientes;
create policy clientes_select on public.clientes
  for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

drop policy clientes_update on public.clientes;
create policy clientes_update on public.clientes
  for update to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  )
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

drop policy vehiculos_select on public.vehiculos;
create policy vehiculos_select on public.vehiculos
  for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

drop policy vehiculos_insert on public.vehiculos;
create policy vehiculos_insert on public.vehiculos
  for insert to authenticated
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

drop policy ordenes_select on public.ordenes;
create policy ordenes_select on public.ordenes
  for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- ===== COLUMNAS DE CLIENTES =====

alter table public.clientes
  drop column user_id,
  drop column bloqueado;

-- ===== ROL DE LAS CUENTAS NUEVAS =====
-- El registro público se apaga en el dashboard. Si igual se crea una cuenta
-- (por ejemplo, desde Authentication → Users), queda como 'pendiente': no ve
-- nada hasta que un admin le asigne 'admin' o 'demo'.

alter table public.usuarios drop constraint usuarios_rol_check;
alter table public.usuarios
  add constraint usuarios_rol_check check (rol in ('admin', 'demo', 'pendiente')),
  alter column rol set default 'pendiente';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  -- nunca se toma el rol de la metadata del registro
  insert into public.usuarios (id, nombre, correo, rol)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nombre',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    new.email,
    'pendiente'
  );
  return new;
end;
$$;
