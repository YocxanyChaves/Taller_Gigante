-- Rendimiento (hoja de ruta, sección D). No cambia quién puede ver o tocar qué.
--
-- 1. Índices en las llaves foráneas que se usan para filtrar.
-- 2. Políticas con (select ...): el rol y el uid se calculan una vez por
--    consulta y no una vez por fila.
-- 3. Políticas solo para `authenticated`: nadie sin sesión llega a las tablas
--    (la página de inicio usa get_stats_publicas, que no depende de RLS).
-- 4. Una sola política UPDATE por tabla en clientes y usuarios.

-- ===== ÍNDICES =====

create index if not exists idx_vehiculos_id_cliente on public.vehiculos (id_cliente);
create index if not exists idx_ordenes_id_vehiculo on public.ordenes (id_vehiculo);
create index if not exists idx_solicitudes_vinculacion_cliente_id on public.solicitudes_vinculacion (cliente_id);

-- ===== CLIENTES =====

drop policy clientes_select_scoped on public.clientes;
drop policy clientes_insert_scoped on public.clientes;
drop policy clientes_update_scoped on public.clientes;
drop policy clientes_update_self on public.clientes;
drop policy clientes_delete_scoped on public.clientes;

create policy clientes_select on public.clientes for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false and user_id = (select auth.uid()))
  );

create policy clientes_insert on public.clientes for insert to authenticated
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- antes: clientes_update_scoped (admin/demo) + clientes_update_self (cliente)
create policy clientes_update on public.clientes for update to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false and user_id = (select auth.uid()))
  )
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false and user_id = (select auth.uid()))
  );

create policy clientes_delete on public.clientes for delete to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- ===== VEHÍCULOS =====

drop policy vehiculos_select_scoped on public.vehiculos;
drop policy vehiculos_insert_scoped on public.vehiculos;
drop policy vehiculos_update_scoped on public.vehiculos;
drop policy vehiculos_delete_scoped on public.vehiculos;

create policy vehiculos_select on public.vehiculos for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false
        and id_cliente in (select c.id from public.clientes c where c.user_id = (select auth.uid())))
  );

create policy vehiculos_insert on public.vehiculos for insert to authenticated
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false
        and id_cliente in (select c.id from public.clientes c where c.user_id = (select auth.uid())))
  );

create policy vehiculos_update on public.vehiculos for update to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  )
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

create policy vehiculos_delete on public.vehiculos for delete to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- ===== ÓRDENES =====

drop policy ordenes_select_scoped on public.ordenes;
drop policy ordenes_insert_scoped on public.ordenes;
drop policy ordenes_update_scoped on public.ordenes;
drop policy ordenes_delete_scoped on public.ordenes;

create policy ordenes_select on public.ordenes for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
    or ((select public.get_my_role()) = 'cliente' and es_demo = false
        and id_vehiculo in (
          select v.id from public.vehiculos v
          join public.clientes c on c.id = v.id_cliente
          where c.user_id = (select auth.uid())
        ))
  );

create policy ordenes_insert on public.ordenes for insert to authenticated
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

create policy ordenes_update on public.ordenes for update to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  )
  with check (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

create policy ordenes_delete on public.ordenes for delete to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- ===== SOLICITUDES DE VINCULACIÓN =====

drop policy solicitudes_select_scoped on public.solicitudes_vinculacion;
drop policy solicitudes_insert_scoped on public.solicitudes_vinculacion;
drop policy solicitudes_update_admin on public.solicitudes_vinculacion;

create policy solicitudes_select on public.solicitudes_vinculacion for select to authenticated
  using (
    (select public.get_my_role()) = 'admin'
    or ((select public.get_my_role()) = 'cliente' and user_id = (select auth.uid()))
  );

create policy solicitudes_insert on public.solicitudes_vinculacion for insert to authenticated
  with check (
    (select public.get_my_role()) = 'cliente'
    and user_id = (select auth.uid())
    and estado = 'pendiente'
  );

create policy solicitudes_update on public.solicitudes_vinculacion for update to authenticated
  using ((select public.get_my_role()) = 'admin')
  with check ((select public.get_my_role()) = 'admin');

-- ===== USUARIOS =====

drop policy usuarios_select_own_or_admin on public.usuarios;
drop policy usuarios_update_admin on public.usuarios;
drop policy usuarios_update_own on public.usuarios;

create policy usuarios_select on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or (select public.get_my_role()) = 'admin');

-- antes: usuarios_update_admin + usuarios_update_own. Cambiar el rol lo sigue
-- controlando el trigger proteger_rol_usuario.
create policy usuarios_update on public.usuarios for update to authenticated
  using (id = (select auth.uid()) or (select public.get_my_role()) = 'admin')
  with check (id = (select auth.uid()) or (select public.get_my_role()) = 'admin');
