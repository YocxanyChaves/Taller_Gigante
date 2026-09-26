# Base de datos (Supabase)

Proyecto `TallerMecánicoGigante` (id `kwaurgcbtjesaswmladd`), Postgres 17.

Mucha de la lógica importante del sistema vive aquí y no en el frontend:
quién puede ver qué, qué pasos puede dar un trabajo, qué ve el cliente con su
link y cómo se calcula la plata. Este archivo explica cada pieza.

## Migraciones

Todo cambio a la base se hace con un archivo nuevo en `migrations/`, nunca a
mano en el dashboard. El nombre es `AAAAMMDDHHMMSS_descripcion.sql` y la fecha
coincide con la versión que guarda Supabase.

| Archivo | Qué es |
|---|---|
| `20260926202645_esquema_base.sql` | Foto completa del esquema al 26/09/2026. Consolida todo lo anterior (las tablas originales se crearon a mano). Sirve para levantar una base nueva desde cero. |
| `20260926202646_seguridad_registro_y_roles.sql` | Cierra dos huecos: registrarse como admin y quedar vinculado a la ficha de otro cliente por su teléfono. |
| `20260926203615_rendimiento_politicas_e_indices.sql` | Índices en llaves foráneas y políticas RLS optimizadas (misma lógica, una política por acción). |
| `20260926203757_tipos_de_datos.sql` | Costos y kilometraje pasan a número, `fecha_entrega` es opcional y con zona horaria, y la placa es única. |
| `20260926225637_quitar_rol_cliente.sql` | Fase 1. Los clientes ya no tienen cuenta: se borran el rol `cliente`, sus cuentas, la vinculación cuenta↔ficha, las solicitudes y el bloqueo. |
| `20260926225647_ordenes_estados_y_recepcion.sql` | Fase 1. Estados del flujo real, `problema_reportado`, cita, recepción, link público y respuesta del cliente. |
| `20260926225714_items_pagos_historial.sql` | Fase 1. Tablas `orden_items`, `pagos` y `orden_estados_historial`, y la vista `ordenes_totales`. Los costos viejos pasan a un ítem. |
| `20260926225809_funciones_trabajos.sql` | Fase 1. Pasos permitidos, link público, regenerar link y cálculos del dashboard. |
| `20260926225837_renombrar_anio.sql` | Fase 1. `vehiculos."año"` → `anio`. |

Antes de la fase 1 se sacó un respaldo de los datos en `respaldos/` (fuera de git).

> **Si algún día se usa el CLI de Supabase:** el historial remoto tiene 23
> migraciones de julio 2026 que no están como archivos (quedaron dentro del
> esquema base). Antes del primer `supabase db push`, márcalas como
> "revertidas" con `supabase migration repair --status reverted <versión>` y
> la base como aplicada con `supabase migration repair --status applied 20260926202645`.

## Tablas

```
auth.users ──1:1── usuarios (rol: admin | demo | pendiente)

clientes ──< vehiculos ──< ordenes ──< orden_items
                              │   ├──< pagos
                              │   └──< orden_estados_historial
                              └── token_publico (link del cliente)
```

- **usuarios**: una fila por cuenta de login. Solo el tío/admin y el demo. La crea el trigger `on_auth_user_created` como `pendiente` (no ve nada hasta que un admin le cambie el rol).
- **clientes**: la ficha del cliente en el taller. Los clientes no tienen cuenta.
- **vehiculos**: pertenecen a un cliente. `id_cliente` puede quedar nulo si se borró el cliente conservando el historial. `kilometraje` y `anio` son enteros. La placa es única entre vehículos reales, sin importar mayúsculas, guiones ni espacios (índice `vehiculos_placa_unica`).
- **ordenes**: en la interfaz se llaman **trabajos**. Campos principales:
  - `estado` (ver abajo), `problema_reportado` (obligatorio), `diagnostico`.
  - Cita y recepción: `fecha_cita`, `fecha_ingreso`, `km_entrada`, `nivel_combustible` (`vacio`, `1/4`, `1/2`, `3/4`, `lleno`), `notas_recepcion`.
  - Link del cliente: `token_publico` (uuid único).
  - Respuesta del cliente: `aprobada`, `respondida_en`, `comentario_cliente`.
  - Cobro: `modalidad_pago` (`contado` o `cuotas`), `cobro_revision` (opcional, si no aprobó) y `fecha_entrega` (se llena sola al entregar).
- **orden_items**: el detalle del precio. `tipo` es `repuesto`, `mano_obra` u `otro`. `subtotal` se calcula solo. `costo_unitario` es opcional (lo que le costó al taller, para la ganancia); el cliente nunca lo ve.
- **pagos**: cada pago o abono. `metodo` es `efectivo`, `sinpe` o `transferencia`.
- **orden_estados_historial**: cada cambio de estado con su fecha. `cambiado_por` nulo = lo hizo el cliente desde su link. Solo lo escribe un trigger.
- **ordenes_totales** (vista): por orden, `total`, `pagado`, `saldo`, `costo_repuestos` y `costo_completo` (false si a algún repuesto le falta el costo). Si el cliente no aprobó, el total es solo el `cobro_revision`.

### Estados de un trabajo

| valor | en pantalla |
|---|---|
| `cita` | Cita agendada |
| `en_revision` | En revisión |
| `esperando_aprobacion` | Esperando respuesta del cliente |
| `no_aprobado` | No aprobó |
| `esperando_repuestos` | Esperando repuestos |
| `en_reparacion` | En reparación |
| `listo` | Listo para recoger |
| `entregado` | Entregado |
| `cancelado` | Cancelado |

Pasos permitidos (los valida el trigger `trg_validar_cambio_estado`, venga de donde venga el cambio):
`cita → en_revision → esperando_aprobacion → esperando_repuestos | en_reparacion | no_aprobado`,
`esperando_repuestos → en_reparacion → listo → entregado`, `no_aprobado → entregado`.
También se puede retroceder un paso para corregir, y cancelar mientras no esté entregado.
Un trabajo nuevo empieza como `cita` o `en_revision`.

## Roles y seguridad (RLS)

Todas las tablas tienen RLS, con una política por acción (`<tabla>_select`,
`_insert`, `_update`, `_delete`) y solo para `authenticated`: sin sesión no se
ve nada (el cliente entra solo por las funciones del link). Las políticas
preguntan el rol con `(select public.get_my_role())`; el `select` hace que se
calcule una vez por consulta y no por fila. Usa ese mismo formato en tablas nuevas.

| Rol | Ve | Puede cambiar |
|---|---|---|
| `admin` | Todo lo real (`es_demo = false`) | Todo lo real, y los roles de otros usuarios |
| `demo` | Solo filas `es_demo = true` | Solo filas `es_demo = true` (es un sandbox, no solo lectura) |
| `pendiente` | Nada | Nada |

La columna `es_demo` separa los datos de prueba de los reales y ya no se puede cambiar:
- En `clientes`, `vehiculos` y `ordenes` la pone `enforce_es_demo_flag` según quién crea la fila.
- En `orden_items`, `pagos` y `orden_estados_historial` la copia `heredar_es_demo_de_orden` de su orden. Así el demo no puede colgar ítems o pagos de una orden real.

## Funciones que llama el frontend (RPC)

| Función | Quién | Qué hace |
|---|---|---|
| `get_my_role()` | Políticas y frontend | Devuelve el rol del usuario actual. |
| `avanzar_estado(orden, estado)` | admin, demo | Cambia el estado de un trabajo (con las reglas de arriba) y devuelve la fila. |
| `regenerar_token(orden)` | admin, demo | Link nuevo para el cliente; el viejo deja de funcionar. |
| `resumen_inicio()` | admin, demo | Tarjetas de Inicio: carros en el taller, esperando respuesta, listos y total por cobrar. |
| `resumen_plata(desde, hasta)` | admin, demo | Una fila por mes (hora de Costa Rica): `cobrado` (pagos del mes), `por_cobrar` (saldo de hoy de lo entregado ese mes), `ganancia` (total − costo de repuestos) y `ganancia_aproximada`. |
| `etiqueta_estado(estado)` | admin, demo | El texto en pantalla de un estado. |
| `get_trabajo_publico(token)` | **Sin login** | Lo que ve el cliente con su link: primer nombre, carro, estado e historial, problema, diagnóstico, ítems (sin costos del taller), total, pagado, saldo y si puede responder. Nunca teléfono, correo, dirección ni otros trabajos. Token que no existe → `null`. |
| `responder_cotizacion(token, aprueba, comentario)` | **Sin login** | El cliente aprueba o rechaza. Solo si el trabajo espera respuesta; pasa a `esperando_repuestos` (si hay repuestos), `en_reparacion` o `no_aprobado`. Si ya respondió no cambia nada. |
| `get_stats_publicas()` | Página de inicio (sin login) | Cuenta clientes, vehículos y trabajos entregados reales. |
| `eliminar_cliente_completo(cliente, modo)` | admin (reales), demo (demo) | Se niega si el cliente tiene trabajos sin terminar. Modo `todo` borra vehículos y órdenes; `conservar_historial` los deja sin dueño. |

Las funciones `SECURITY DEFINER` (saltan RLS) son `get_trabajo_publico`,
`responder_cotizacion`, `get_stats_publicas`, `eliminar_cliente_completo` y
`get_my_role`. El linter de Supabase las marca como aviso: es a propósito. Las
tres primeras son públicas por diseño y las otras revisan el rol adentro. Las
demás corren con los permisos de quien llama.

## Triggers

| Trigger | Tabla | Cuándo | Qué hace |
|---|---|---|---|
| `on_auth_user_created` → `handle_new_user` | `auth.users` | Cuenta nueva | Crea la fila en `usuarios` como `pendiente`. |
| `trg_sincronizar_correo_usuario` | `auth.users` | Cambio de correo | Copia el correo nuevo a `usuarios`. |
| `trg_proteger_rol_usuario` | `usuarios` | Al editar | Solo un admin cambia roles (o alguien directo en la base). |
| `trg_validar_cambio_estado` | `ordenes` | Crear / cambiar estado | Revisa que el paso sea permitido, marca `aprobada`/`respondida_en` y llena o vacía `fecha_entrega`. |
| `trg_ordenes_historial` | `ordenes` | Crear / cambiar estado | Anota el cambio en `orden_estados_historial`. |
| `trg_*_es_demo` | `clientes`, `vehiculos`, `ordenes` | Crear/editar | Marca `es_demo` según el rol y lo vuelve inmutable. |
| `trg_*_es_demo` | `orden_items`, `pagos`, `orden_estados_historial` | Crear/editar | Copia `es_demo` de la orden. |
