# Arreglos de Supabase (auditoría del 26/09/2026)

Proyecto: `TallerMecánicoGigante` (id `kwaurgcbtjesaswmladd`), Postgres 17.
Datos al momento de la revisión: 6 clientes, 14 vehículos, 10 órdenes, 4 usuarios (1 admin, 1 demo, 2 clientes), 0 solicitudes.

Vuelve a revisar el estado real antes de aplicar cualquier cosa: puede haber cambiado.

## Contenido
- A. Urgente (seguridad) — hacer ANTES que todo lo demás
- B. Seguridad (importante)
- C. Calidad de datos y tipos
- D. Rendimiento
- E. Cosas que el resumen del proyecto decía distinto
- F. Configuración que la dueña hace a mano en el dashboard

---

## A. Urgente (seguridad)

### A1. Cualquiera se puede registrar como admin 🔴
`handle_new_user()` toma el rol de `raw_user_meta_data->>'rol'`, y esa metadata la controla quien se registra. Con `supabase.auth.signUp({ ..., options: { data: { rol: 'admin' } } })` cualquier persona queda como admin y ve todos los datos reales.

Arreglo: el rol de un registro nuevo es SIEMPRE `'cliente'`; ignorar `rol` de la metadata. Los admin/demo se asignan solo desde un admin (UI de Usuarios) o por SQL.
```sql
v_rol := 'cliente';  -- nunca desde raw_user_meta_data
```
Después: revisar que los 4 usuarios actuales tengan el rol correcto, y quitar `rol` de lo que manda `Register.jsx` en el `signUp` (ya no sirve para nada).

### A2. Vinculación automática por teléfono (sin verificar) 🔴
`handle_new_user()` vincula la cuenta nueva a una ficha existente si coincide el **teléfono** que la persona escribió al registrarse. El teléfono no se verifica, así que alguien que sepa el número de un cliente puede registrarse con ese teléfono y ver sus carros, órdenes y costos.
El match por **correo** también se hace al insertar en `auth.users`, antes de que el correo esté confirmado.

Arreglo inmediato (hasta que exista la invitación por link de la fase 2):
- Quitar por completo el match por teléfono.
- Match por correo solo si `new.email_confirmed_at is not null` (caso OAuth). Si no, crear la ficha nueva como hoy y dejar que el admin vincule.
Arreglo definitivo (fase 1 del plan nuevo): los clientes ya no tienen cuenta. Se apaga el registro público, `handle_new_user` solo crea la fila en `usuarios` y se elimina toda la vinculación cuenta↔ficha (ver `datos.md`).

### A3. `proteger_rol_usuario` con rol nulo
`public.get_my_role() <> 'admin'` da NULL si no hay rol y el trigger deja pasar el cambio. Usar `coalesce(public.get_my_role(), '') <> 'admin'`.

---

## B. Seguridad (importante)

- **Bloqueo solo en el frontend:** `clientes.bloqueado` no aparece en ninguna política. Un cliente bloqueado puede leer sus datos igual llamando a la API. En el plan nuevo el bloqueo desaparece junto con el rol cliente (fase 1): quitar columna, trigger `proteger_bloqueo_cliente` y UI (confirmar).
- **Demo compartido y editable:** el rol demo puede insertar/editar/borrar filas `es_demo = true` (no es solo lectura). Si las credenciales demo se publican en el portafolio, cualquiera puede vaciar o ensuciar los datos demo. Propuesta: función `reset_datos_demo()` + `pg_cron` que la corra cada noche con datos semilla (confirmar si se prefiere hacer demo solo lectura).
- **Funciones SECURITY DEFINER expuestas** (avisos del linter): `eliminar_cliente_completo` y `fusionar_cliente_vinculado` validan el rol adentro, están bien, pero documentarlo. `get_stats_publicas` la puede llamar `anon`: es intencional, porque la usa la página de inicio. Se deja así. `get_my_role` expuesto a `authenticated` es aceptable (devuelve el rol propio).
- **`eliminar_cliente_completo`** tiene los estados escritos a mano (`'Pendiente','En proceso'`): actualizarla cuando cambien los estados (fase 1).

---

## C. Calidad de datos y tipos

Hacer como migraciones con limpieza previa; mostrar a la dueña los valores que no se puedan convertir automáticamente antes de migrar.

- **`ordenes.costo_estimado` y `costo_final` son `text`.** Hay valores como `"20.222"` (¿20 mil o 20,222?), `""` y `"0"`. Casi todas las órdenes "Completado" tienen `costo_final` vacío, así que los **ingresos del dashboard salen mal**. Pasar a `numeric(12,2)` nullable; en la fase 1 el total pasa a salir de `orden_items` y los ingresos de `pagos`.
- **`ordenes.fecha_entrega` es NOT NULL y `timestamp` sin zona.** Obliga a inventar una fecha de entrega para órdenes que no se han entregado. Pasar a `timestamptz` nullable, y que se llene solo al pasar a "Entregado".
- **`ordenes.costo_final` NOT NULL** con valor vacío: quitar el NOT NULL.
- **`ordenes.estado` sin CHECK:** agregar el CHECK con la lista final de estados (fase 1).
- **`vehiculos.kilometraje` es `text`** con valores como `"20.000KM"`, `"1500 km"`, `"500000 KM"`. Pasar a `integer` (quitar letras y separadores; marcar para revisión los valores dudosos, como 500000).
- **Placa duplicada:** `DSF456` aparece más de una vez. Resolver con la dueña y luego crear un índice único sobre la placa normalizada (`upper`, sin guiones ni espacios), solo para `es_demo = false`.
- **Columna `año`:** la ñ en identificadores da problemas en código y consultas. Propuesta: renombrar a `anio` (confirmar; hay que tocar el frontend).
- **3 vehículos sin cliente** (quedan así por el modo `conservar_historial`). Es intencional, pero el Dashboard, el Historial y los filtros deben soportarlo sin romperse.
- **FKs sin `on delete`:** `vehiculos.id_cliente` y `ordenes.id_vehiculo` no definen comportamiento. Dejarlo explícito (`restrict` o `set null`) de acuerdo con la lógica de `eliminar_cliente_completo`.

---

## D. Rendimiento (el linter lo marca)

- Índices faltantes en FKs: `vehiculos(id_cliente)`, `ordenes(id_vehiculo)`, `solicitudes_vinculacion(cliente_id)`.
- En todas las políticas, cambiar `auth.uid()` por `(select auth.uid())` y `get_my_role()` por `(select public.get_my_role())`, para que se evalúen una vez y no por cada fila.
- Unir las políticas UPDATE duplicadas (`clientes_update_scoped` + `clientes_update_self`, `usuarios_update_admin` + `usuarios_update_own`) en una por tabla, y restringirlas a `to authenticated` (hoy aplican a `public`, anon incluido).
- En tablas nuevas, crear las políticas ya con este formato.

---

## E. Cosas que el resumen decía distinto

- El rol **demo** no es de solo lectura (la etiqueta de `Usuarios.jsx` que dice "solo lectura" está desactualizada; corregirla): es un sandbox que escribe sobre filas `es_demo = true`. El trigger `enforce_es_demo_flag` marca esas filas y las vuelve inmutables.
- Ya **existe vinculación automática** en el registro (por correo/teléfono, ver A2), además del flujo de solicitudes. Por eso se crean fichas duplicadas y hace falta la fusión. En la práctica, el formulario de solicitud del portal casi nunca se usa: el flujo real es registro → ficha automática → el admin fusiona desde "Vincular cuenta".
- Hay más lógica en triggers de la que se veía: `sincronizar_datos_cliente_vinculado` (los datos de la cuenta pisan los de la ficha al vincular), `proteger_datos_cliente_vinculado` (el admin no puede editar el contacto de un cliente vinculado), `bloquear_desvinculacion_cliente` y `sincronizar_correo_usuario`. Todo esto va documentado en `supabase/README.md` (fase 0).

---

## F. Configuración a mano (decírselo a la dueña, no se hace por SQL)

- Activar la **protección contra contraseñas filtradas** en Auth, si el plan lo permite.
- Confirmar que la **confirmación de correo** está activada en Auth → Providers → Email.
- Revisar que la URL de redirección de OAuth apunte al dominio real.
