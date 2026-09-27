# Fases

Orden pensado para que cada fase deje algo usable. No mezclar fases. Cada una cierra actualizando el README.

## Contenido
- Fase 0 — Seguridad y limpieza de la base de datos
- Fase 1 — Modelo de datos nuevo
- Fase 2 — Base del frontend nuevo (diseño + estructura)
- Fase 3 — Trabajos: nuevo trabajo, tablero y siguiente paso
- Fase 4 — Link del cliente y WhatsApp
- Fase 5 — Cobros (con el gráfico de plata) y el resto de Inicio
- Fase 6 — Clientes
- Fase 7 — Extras

---

## Fase 0 — Seguridad y limpieza de la base de datos

Detalle en `supabase-arreglos.md`.
1. Sección A (urgente): rol siempre `cliente` en `handle_new_user`, quitar vinculación por teléfono, `coalesce` en `proteger_rol_usuario`. Pedirle a la dueña que **desactive el registro público** en Supabase → Authentication → Sign In / Providers ("Allow new users to sign up" apagado): en el sistema nuevo nadie se registra solo.
2. Sección D (rendimiento): índices en FKs, `(select ...)` en políticas, unir políticas duplicadas y ponerlas `to authenticated`.
3. Sección C (datos): costos a `numeric`, `kilometraje` a `integer`, `fecha_entrega` nullable `timestamptz`, resolver placa duplicada + índice único. Mostrar antes los valores que no convierten solos.
4. Versionar todo el esquema en `supabase/migrations/` y documentar funciones/triggers en `supabase/README.md`.
5. Crear el subagente `tester` si la dueña lo quiere (ver sección al final).

Listo cuando: registrarse con `rol: 'admin'` en la metadata ya no da admin (o el registro está apagado), el linter de Supabase no marca advertencias de seguridad/rendimiento propias, y los datos viejos están limpios.

## Fase 1 — Modelo de datos nuevo

Detalle en `datos.md`. Todo en migraciones, con RLS y `es_demo`.
1. Ampliar `ordenes` (se muestra en la interfaz como "trabajos"): estados nuevos + CHECK, `problema_reportado`, `fecha_cita`, datos de recepción, `token_publico`, aprobación, `modalidad_pago`.
2. Tablas nuevas: `orden_items`, `pagos`, `orden_estados_historial` (con trigger).
3. Migrar estados viejos (Pendiente→en_revision, En proceso→en_reparacion, Completado→entregado) — **confirmar**. Pasar costos viejos a un ítem "Trabajo registrado antes del sistema nuevo".
4. Funciones: `get_trabajo_publico(token)`, `responder_cotizacion(token, aprueba)`, `avanzar_estado(orden_id, nuevo_estado)`, vistas/funciones del dashboard (`resumen_plata(desde, hasta)`).
5. Actualizar `eliminar_cliente_completo` y `get_stats_publicas` a los estados nuevos.
6. **Confirmar y luego quitar:** rol `cliente` y sus políticas, `solicitudes_vinculacion`, `fusionar_cliente_vinculado`, vinculación en `handle_new_user`, `clientes.user_id` + triggers de vinculación/sincronización, `clientes.bloqueado` + su trigger.

Listo cuando: se puede simular por SQL un trabajo completo de cita a entregado con cuotas, y el link público devuelve solo lo que debe (sin teléfono ni dirección).

## Fase 2 — Base del frontend nuevo

En rama `v2`. Detalle visual en `diseno.md`.
1. Tokens de diseño (CSS variables) + fuentes.
2. Componentes base: `Ventana`, `Boton` (primario/secundario/peligro), `Campo` (input con etiqueta), `Tarjeta` de número, `Insignia` de estado, `Asistente` (pasos), `Confirmar` (diálogo), `Vacio` (estado sin datos con instrucción).
3. Estructura (hecha): Inicio es un menú "¿Qué desea hacer?" con 4 opciones grandes; las demás pantallas tienen "← Inicio" y el botón rojo "Recibir un carro" arriba.
4. Login nuevo (solo correo y contraseña, mensajes de error en español claro).
5. `AuthContext` + `useAuth()` único.
6. Página `/estilos` (solo admin) que muestre todos los componentes, para revisar el diseño con la dueña antes de seguir.

Listo cuando: la dueña aprueba `/estilos` y el login.

## Fase 3 — Trabajos

Detalle en `pantallas.md`.
1. Asistente "Nuevo trabajo" (teléfono → cliente → placa → problema → cita).
2. Pantalla Trabajos: tablero por etapa.
3. Ficha del trabajo con el botón de siguiente paso y la línea de tiempo.
4. Cotización: agregar repuestos y mano de obra (con costo opcional), total automático.
5. Recepción: km de entrada, combustible, notas (fotos quedan para fase 7).

Listo cuando: el tío (o la dueña haciendo de tío) puede llevar un carro de cita a listo sin ayuda ni explicación.

## Fase 4 — Link del cliente y WhatsApp

1. Página pública `/t/:token` (sin login): estado con línea de tiempo, carro, diagnóstico, detalle y total, saldo, botones grandes "Sí, hágale" / "No, gracias" cuando está esperando aprobación, botón de WhatsApp al taller.
2. Botones de WhatsApp + "Copiar mensaje" en los momentos clave (ver `pantallas.md`).
3. Regenerar link (por si se mandó al número equivocado).

Listo cuando: desde un celular sin sesión se abre el link, se aprueba, y el trabajo avanza solo a "Esperando repuestos" en la pantalla del tío.

## Fase 5 — Cobros y el resto de Inicio

1. Entregar y cobrar: contado o cuotas; registrar abonos; saldo.
2. Pantalla Cobros: quién debe, cuánto, desde cuándo, botón "Registrar abono" y "Recordar por WhatsApp".
3. Cobros lleva arriba las tarjetas de plata y el gráfico (ver `diseno.md` y `datos.md`). Inicio se queda como menú + "Para hoy" (ya muestra listos y esperando respuesta con `resumen_inicio()`). Sin tablas de órdenes recientes ni actividad reciente.
4. Alertas de DEKRA (reusar `lib/dekra.js`) como una línea más en el "Para hoy" de Inicio.

## Fase 6 — Clientes

Buscador único (nombre, teléfono o placa) → ficha del cliente: datos, carros, historial de trabajos por carro, lo que debe, botón "Nuevo trabajo para este cliente".

## Fase 7 — Extras (solo si el taller lo pide)

Fotos de recepción (Supabase Storage privado), comprobante PDF, recordatorios de mantenimiento, página pública del taller, reinicio nocturno de datos demo, inventario.

---

## Subagente de pruebas (opcional)

Si la dueña lo pide, crear `.claude/agents/tester.md`: escribe y corre pruebas (Vitest + React Testing Library; pruebas de RLS y de las funciones públicas por token), nunca contra producción, solo reporta y propone arreglos.
