# Detalle de las fases

## Contenido
- Fase 0 — Ordenar la casa
- Fase 1 — Núcleo del taller
- Fase 2 — Portal del cliente
- Fase 3 — Retención y visibilidad
- Fase 4 — Extras

Los esquemas SQL son propuestas: ajústalos al esquema real. Los ids existentes son `bigint`; para el rol usa `(select public.get_my_role())`, y cada tabla nueva lleva `es_demo boolean default false` con el trigger `enforce_es_demo_flag`, igual que las actuales, para que el demo funcione.

---

## Fase 0 — Ordenar la casa

Objetivo: que el proyecto se entienda solo y sea fácil de extender. Sin funciones nuevas.

Tareas:
0. **Arreglos de Supabase:** aplicar `references/supabase-arreglos.md`: sección A (urgente, primera migración), luego B y D. De la sección C, en esta fase solo lo que no depende de la fase 1: `fecha_entrega` nullable + `timestamptz`, `kilometraje` a integer, costos a `numeric`, índice único de placa (después de resolver el duplicado). La sección F se le avisa a la dueña.
1. **Versionar Supabase:** exportar el esquema actual (tablas, triggers, funciones, políticas RLS) a `supabase/migrations/` como migración base. Documentar cada función/trigger en `supabase/README.md` (qué hace y quién la llama).
2. **`useAuth` único:** crear `AuthContext` + hook `useAuth()` que exponga `user`, `rol`, `clienteId`, `loading`, `esAdmin`, `esDemo`, `esCliente`. Reemplazar las 4 consultas de rol (App, Sidebar, Topbar, Dashboard).
3. **Partir `Clientes.jsx`:** separar en componentes (tabla, formulario, detalle, modal de solicitudes, acciones peligrosas) y mover llamadas a Supabase a `services/clientes.js`.
4. **Partir `ClientePortal.jsx`:** igual (perfil, mis vehículos, mis órdenes, vinculación) + `services/portal.js`.
5. **README real:** qué es, stack, roles, cómo correrlo, variables de entorno, estructura de carpetas, diagrama de tablas, sección "Hoja de ruta" con las fases.

Listo cuando: los huecos de la sección A están cerrados y probados (registrarse con `rol: 'admin'` en la metadata da `cliente`; registrarse con el teléfono de otro cliente no da acceso a su ficha), el linter de Supabase no muestra advertencias de rendimiento, la app funciona igual con los 3 roles, no quedan consultas de rol duplicadas y ningún archivo pasa de ~400 líneas.

---

## Fase 1 — Núcleo del taller

Objetivo: lo que el taller usa a diario.

### 1.1 Recepción del vehículo
Agregar a `ordenes`: `km_entrada int`, `nivel_combustible text` (ej. 'E','1/4','1/2','3/4','F'), `observaciones_recepcion text`, `recibido_en timestamptz default now()`.
Actualizar `vehiculos.km` con `km_entrada` al crear la orden (si es mayor).

Fotos de recepción (sirven para defender al taller de reclamos):
```sql
create table orden_fotos (
  id uuid primary key default gen_random_uuid(),
  orden_id bigint references ordenes(id) on delete cascade,
  storage_path text not null,
  tipo text not null check (tipo in ('recepcion','reparacion')),
  descripcion text,
  created_at timestamptz default now()
);
```
Bucket de Storage **privado** `ordenes`, ruta `orden_id/archivo`. Mostrar con URLs firmadas. Comprimir imágenes en el cliente antes de subir (el celular del taller saca fotos pesadas).

### 1.2 Orden con ítems (base de la cotización)
```sql
create table orden_items (
  id uuid primary key default gen_random_uuid(),
  orden_id bigint references ordenes(id) on delete cascade,
  tipo text not null check (tipo in ('repuesto','mano_obra','otro')),
  descripcion text not null,
  cantidad numeric not null default 1 check (cantidad > 0),
  precio_unitario numeric not null check (precio_unitario >= 0),
  subtotal numeric generated always as (cantidad * precio_unitario) stored,
  created_at timestamptz default now()
);
```
El total de la orden sale de la suma de ítems (vista o cálculo), no de un campo escrito a mano. Mantener los campos de costo viejos solo mientras se migra; luego proponer eliminarlos (confirmar).

### 1.3 Estados reales
Propuesta: `Recibido → En diagnóstico → Esperando aprobación → Esperando repuesto → En reparación → Listo → Entregado` (+ `Cancelado`).
Mapeo sugerido de datos viejos: Pendiente→Recibido, En proceso→En reparación, Completado→Entregado. **Confirmar antes de migrar.**
Guardar historial de cambios de estado:
```sql
create table orden_estados_historial (
  id uuid primary key default gen_random_uuid(),
  orden_id bigint references ordenes(id) on delete cascade,
  estado text not null,
  cambiado_por uuid references auth.users(id),
  created_at timestamptz default now()
);
```
(trigger que inserta al cambiar `ordenes.estado`). El historial alimenta la línea de tiempo del portal en la fase 2.
Actualizar Dashboard, Historial, filtros, `eliminar_cliente_completo` (estados activos) y `get_stats_publicas` (`'Completado'` → `'Entregado'`) con los estados nuevos. Agregar el CHECK en `ordenes.estado`.

### 1.4 Pagos
```sql
create table pagos (
  id uuid primary key default gen_random_uuid(),
  orden_id bigint references ordenes(id) on delete cascade,
  monto numeric not null check (monto > 0),
  metodo text not null, -- efectivo, sinpe, tarjeta, transferencia (confirmar lista)
  nota text,
  pagado_en timestamptz default now()
);
```
Vista `ordenes_saldo` (total, pagado, saldo). Dashboard: ingresos del mes basados en **pagos**, y nueva tarjeta "Por cobrar".

RLS fase 1: admin todo; demo solo lectura; cliente lectura de ítems, fotos, pagos y historial de **sus** órdenes.

Listo cuando: se puede recibir un carro con fotos, armar la orden con ítems, moverla por todos los estados, registrar abonos y ver el saldo; todo visible (enmascarado) con demo.

---

## Fase 2 — Portal del cliente

### 2.1 Invitación por link (reemplaza solicitudes + fusión)
```sql
create table invitaciones (
  id uuid primary key default gen_random_uuid(),
  cliente_id bigint references clientes(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  expira_en timestamptz not null default now() + interval '7 days',
  usada_en timestamptz
);
```
- Admin: botón "Invitar al portal" en la ficha → genera link `/registro?invitacion=<token>` y botón para compartirlo por WhatsApp (`wa.me/506<telefono>?text=...`, gratis).
- RPC `aceptar_invitacion(token)` (security definer): valida vigencia y que no esté usada, vincula `auth.uid()` a la ficha, marca `usada_en`. Si la cuenta ya tenía otra ficha, no fusionar automáticamente: devolver error claro.
- Cuando funcione y esté probado: proponer eliminar `solicitudes_vinculacion`, su UI y `fusionar_cliente_vinculado` (**confirmar**; revisar antes si hay solicitudes pendientes).

### 2.2 Aprobación de cotización
Agregar a `ordenes`: `aprobada_en timestamptz`, `aprobada_por uuid`, `rechazada_en timestamptz`, `motivo_rechazo text`.
- En "Esperando aprobación", el cliente ve los ítems y el total, y aprueba o rechaza desde el portal (RPC que valida que la orden sea suya y esté en ese estado).
- Al aprobar pasa a "Esperando repuesto" o "En reparación" (lo decide el admin; por defecto "En reparación").
- El admin ve un indicador de aprobaciones pendientes.

### 2.3 Portal más claro
Línea de tiempo del estado (desde `orden_estados_historial`), fotos de recepción y reparación, saldo pendiente y botón de WhatsApp al taller.

Listo cuando: un cliente nuevo entra por link sin intervención del admin, aprueba una cotización y ve su carro avanzar.

---

## Fase 3 — Retención y visibilidad

### 3.1 Recordatorios de mantenimiento
Generalizar la lógica de `lib/dekra.js`:
```sql
create table mantenimientos (
  id uuid primary key default gen_random_uuid(),
  vehiculo_id bigint references vehiculos(id) on delete cascade,
  tipo text not null,          -- 'cambio_aceite', 'frenos', 'alineado', ...
  cada_km int,
  cada_meses int,
  ultimo_km int,
  ultima_fecha date
);
```
Dashboard: sección "Próximos mantenimientos" junto a DEKRA. Al cerrar una orden, ofrecer actualizar el mantenimiento correspondiente.

### 3.2 Notificaciones por correo
Edge Function de Supabase + proveedor de correo (ej. Resend): aviso cuando la orden pasa a "Esperando aprobación" y a "Listo", y recordatorios de DEKRA/mantenimiento. Sin WhatsApp API (tiene costo).

### 3.3 Comprobante PDF de la orden
Generar PDF con datos del taller, cliente, vehículo, ítems, total, pagos y saldo. Aclarar en el documento que **no es factura electrónica**.

### 3.4 Página pública
Ruta `/` pública (o sitio aparte): servicios, horario, ubicación con mapa, fotos, botón de WhatsApp, botón "Ver mi carro" (login). Buen SEO básico (title, meta description, Open Graph).

---

## Fase 4 — Extras (solo si el taller lo pide)

- **Inventario de repuestos:** tabla `repuestos` (código, nombre, stock, costo, precio, mínimo); al agregar un ítem tipo repuesto, elegir del inventario y descontar stock; alerta de stock bajo.
- **Mecánico asignado:** rol `mecanico` (ve solo sus órdenes y cambia estados), campo `ordenes.mecanico_id`.
- **Reportes:** ingresos por mes, trabajos más comunes, ticket promedio, clientes recurrentes, carros por marca.
