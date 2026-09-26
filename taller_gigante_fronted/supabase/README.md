# Base de datos (Supabase)

Proyecto `TallerMecánicoGigante` (id `kwaurgcbtjesaswmladd`), Postgres 17.

Mucha de la lógica importante del sistema vive aquí y no en el frontend:
quién puede ver qué, cómo se vincula una cuenta con su ficha, qué pasa al
borrar un cliente. Este archivo explica cada pieza.

## Migraciones

Todo cambio a la base se hace con un archivo nuevo en `migrations/`, nunca a
mano en el dashboard. El nombre es `AAAAMMDDHHMMSS_descripcion.sql`.

| Archivo | Qué es |
|---|---|
| `20260926202645_esquema_base.sql` | Foto completa del esquema al 26/09/2026. Consolida todo lo anterior (las tablas originales se crearon a mano). Sirve para levantar una base nueva desde cero. |
| `20260926202646_seguridad_registro_y_roles.sql` | Cierra dos huecos: registrarse como admin y quedar vinculado a la ficha de otro cliente por su teléfono. |

> **Si algún día se usa el CLI de Supabase:** el historial remoto tiene 23
> migraciones de julio 2026 que no están como archivos (quedaron dentro del
> esquema base). Antes del primer `supabase db push`, márcalas como
> "revertidas" con `supabase migration repair --status reverted <versión>` y
> la base como aplicada con `supabase migration repair --status applied 20260926202645`.

## Tablas

```
auth.users ──1:1── usuarios (rol: admin | demo | cliente)
     │
     └── user_id (opcional) ── clientes ──< vehiculos ──< ordenes
                                   ▲
            solicitudes_vinculacion┘
```

- **usuarios**: una fila por cuenta de login. La crea el trigger `on_auth_user_created`.
- **clientes**: la ficha del cliente en el taller. Puede existir sin cuenta (`user_id` nulo).
- **vehiculos**: pertenecen a un cliente. `id_cliente` puede quedar nulo si se borró el cliente conservando el historial.
- **ordenes**: trabajos hechos a un vehículo. Estados: `Pendiente`, `En proceso`, `Completado`.
- **solicitudes_vinculacion**: un cliente pide que conecten su cuenta con su ficha; el admin aprueba o rechaza.

## Roles y seguridad (RLS)

Todas las tablas tienen RLS. Las políticas preguntan el rol con `get_my_role()`.

| Rol | Ve | Puede cambiar |
|---|---|---|
| `admin` | Todo lo real (`es_demo = false`) | Todo lo real, y los roles de otros usuarios |
| `demo` | Solo filas `es_demo = true` | Solo filas `es_demo = true` (es un sandbox, no solo lectura) |
| `cliente` | Su ficha, sus vehículos y sus órdenes | Sus datos de contacto y agregar vehículos propios |

La columna `es_demo` separa los datos de prueba de los reales: la pone el trigger
`enforce_es_demo_flag` al crear la fila (según quién la crea) y ya no se puede cambiar.

## Funciones que llama el frontend (RPC)

| Función | Quién la usa | Qué hace |
|---|---|---|
| `get_my_role()` | Políticas y triggers | Devuelve el rol del usuario actual. |
| `get_stats_publicas()` | Página de inicio (sin login) | Cuenta clientes, vehículos y órdenes completadas reales. Es pública a propósito. |
| `fusionar_cliente_vinculado(destino, usuario)` | *Clientes → Vincular cuenta* | Solo admin. Vincula una cuenta a una ficha. Si la cuenta ya tenía otra ficha, mueve sus vehículos a la nueva y borra la vieja. |
| `eliminar_cliente_completo(cliente, modo)` | *Clientes → Eliminar* | Admin (reales) o demo (demo). Se niega si hay órdenes activas. Modo `todo` borra vehículos y órdenes; `conservar_historial` los deja sin dueño. **También borra la cuenta de login.** |

`fusionar_cliente_vinculado` y `eliminar_cliente_completo` son `SECURITY DEFINER`
(saltan RLS), por eso revisan el rol adentro antes de hacer nada.

## Triggers

| Trigger | Tabla | Cuándo | Qué hace |
|---|---|---|---|
| `on_auth_user_created` → `handle_new_user` | `auth.users` | Registro | Crea la fila en `usuarios` (siempre `cliente`). Vincula una ficha existente solo si el correo lo verificó Google u otro OAuth; si no, crea una ficha nueva. |
| `trg_sincronizar_correo_usuario` | `auth.users` | Cambio de correo | Copia el correo nuevo a `usuarios`. |
| `trg_sincronizar_datos_cliente_vinculado` | `clientes` | Al vincular | Los datos de la cuenta (nombre, correo, teléfono) pisan los de la ficha. |
| `trg_proteger_datos_cliente_vinculado` | `clientes` | Al editar | El admin no puede cambiar el contacto de un cliente vinculado; eso lo hace el cliente. |
| `trg_bloquear_desvinculacion_cliente` | `clientes` | Al editar | Una ficha vinculada no se puede desvincular. |
| `trg_proteger_bloqueo_cliente` | `clientes` | Al editar | Solo admin/demo cambian `bloqueado`. |
| `trg_proteger_rol_usuario` | `usuarios` | Al editar | Solo un admin cambia roles (o alguien directo en la base). |
| `trg_*_es_demo` | `clientes`, `vehiculos`, `ordenes` | Crear/editar | Marca `es_demo` y lo vuelve inmutable. |
