# Taller Mecánico Gigante

Sistema de gestión para un taller mecánico en Costa Rica: recibir carros, dar
seguimiento a las reparaciones y cobrar. Incluye un portal donde cada cliente
ve cómo va su carro sin tener que llamar, y un rol demo para mostrar el
sistema funcionando sin exponer datos reales.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4, React Router, Recharts y Framer Motion.
- **Backend:** [Supabase](https://supabase.com): Postgres, login (Auth) y seguridad por fila (RLS).
  No hay servidor propio: la lógica sensible vive en la base (políticas, triggers y funciones).

## Cómo correrlo

Necesitas Node 20 o superior.

```bash
npm install
npm run dev        # abre http://localhost:5173
```

Crea un archivo `.env.local` en esta carpeta (no se sube a git) con los datos
del proyecto de Supabase (*Project Settings → API*):

```
VITE_SUPABASE_URL=https://<id-del-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<clave pública anon>
```

Otros comandos: `npm run build` (compila a `dist/`), `npm run preview` (sirve
lo compilado) y `npm run lint`.

> **¿La página sale en blanco o con `ERR_NAME_NOT_RESOLVED`?** El plan gratis de
> Supabase pausa el proyecto después de unos 7 días sin uso. Entra al dashboard
> de Supabase y dale a *Restore project*.
> Abrir `index.html` directo (doble clic o Live Server) tampoco funciona: usa `npm run dev`.

## Roles

| Rol | Puede |
|---|---|
| `admin` | Todo con los datos reales, y cambiar roles en *Usuarios* |
| `demo` | Lo mismo que admin, pero solo con datos de prueba (`es_demo = true`), separados de los reales |
| `pendiente` | Nada. Es el rol de toda cuenta nueva hasta que un admin le asigne otro |

Los clientes no tienen cuenta: ven su trabajo con un link único, sin registrarse.

## Flujo

1. **Cita**: el cliente llama o escribe y el tío le da un día.
2. **En revisión**: llega el carro y el tío lo examina.
3. **Esperando respuesta**: se anota el diagnóstico y el precio (repuestos y mano de obra)
   y se le manda al cliente su link por WhatsApp. Desde ahí aprueba o rechaza.
   Si no aprueba, se lleva el carro (con cobro de revisión opcional).
4. **Esperando repuestos** → **En reparación** → **Listo** (se le avisa al cliente).
5. **Entregado**: se cobra de contado o en cuotas (abonos hasta saldar).

Inicio también avisa de la **revisión técnica (DEKRA)** que se acerca según el último
dígito de la placa (`src/lib/dekra.js`).

> **Ojo:** la base ya está en el modelo nuevo (fase 1), pero las pantallas todavía son las
> viejas. Varias ya no funcionan (órdenes, portal, vincular cuentas) hasta que se hagan
> las nuevas en las fases 2 a 6.

## Estructura

```
src/
├─ pages/            una pantalla por ruta (Dashboard, Clientes, Vehiculos, Ordenes, ClientePortal…)
├─ components/
│  ├─ layout/        Sidebar, Topbar y Layout del panel
│  ├─ clientes/      tabla y ventanas de la página Clientes
│  ├─ portal/        piezas del portal del cliente
│  ├─ dashboard/     tarjetas del Dashboard
│  └─ Modal.jsx      marco común de las ventanas emergentes
├─ context/
│  ├─ AuthContext    quién inició sesión y con qué rol → useAuth()
│  └─ ThemeContext   modo claro / oscuro → useTheme()
├─ services/         consultas a Supabase agrupadas por pantalla
└─ lib/              supabaseClient, formato (₡, km, fechas), errores, dekra
supabase/
├─ migrations/       todos los cambios a la base, en orden
└─ README.md         tablas, funciones, triggers y políticas explicados
```

Convenciones:
- Nadie consulta la sesión o el rol por su cuenta: se usa `useAuth()`.
- Las fechas de los formularios se guardan con `fechaInputAISO` y se leen con
  `isoAFechaInput` (`src/lib/formato.js`); si no, se ven un día antes en Costa Rica.
- Todo cambio a la base es una migración nueva en `supabase/migrations/`, nunca a mano en el dashboard.

## Base de datos

Siete tablas: `usuarios` (cuentas de login), `clientes`, `vehiculos`, `ordenes` (los
trabajos), `orden_items` (detalle del precio), `pagos` y `orden_estados_historial`.
Detalle completo en [`supabase/README.md`](supabase/README.md).

## Hoja de ruta

**Plan nuevo (26/09/2026):** la base de datos se queda (se limpia y se amplía) y el
frontend se hace de nuevo en la rama `v2`, con un flujo y un diseño nuevos. Los
clientes ya no tienen cuenta: cada trabajo tiene un link único donde ven cómo va
su carro y aprueban o rechazan el precio. Los avisos se mandan por WhatsApp con
el mensaje ya escrito. El plan completo está en `.claude/skills/taller-gigante-roadmap/`.

| Fase | Objetivo | Estado |
|---|---|---|
| 0 | Seguridad y limpieza de la base de datos | ✅ Hecha (falta apagar el registro público) |
| 1 | Modelo de datos nuevo: estados del taller, ítems, pagos, historial y link público | ✅ Hecha |
| 2 | Base del frontend nuevo: diseño, componentes, estructura y login | ⬜ Sigue |
| 3 | Trabajos: asistente "Nuevo trabajo", tablero por etapa y botón de siguiente paso | ⬜ |
| 4 | Link del cliente y WhatsApp | ⬜ |
| 5 | Cobros (contado o cuotas) e Inicio con el gráfico de plata | ⬜ |
| 6 | Clientes: buscador y ficha | ⬜ |
| 7 | Extras, solo si el taller los pide: fotos, PDF, recordatorios, inventario | ⬜ |

### Fase 0: qué se hizo (26/09/2026)

- ✅ Cerrados dos huecos de seguridad: registrarse como admin y ver los datos de otro
  cliente registrándose con su teléfono.
- ✅ Esquema de Supabase versionado en `supabase/migrations/` y documentado.
- ✅ Políticas RLS optimizadas e índices nuevos (el linter de Supabase queda sin advertencias de rendimiento).
- ✅ Costos y kilometraje como números, fecha de entrega opcional y placa única.
- ✅ Un solo `useAuth` en lugar de siete consultas de sesión y rol repartidas.
- ✅ Páginas partidas en componentes y servicios: `Clientes` (1183 → 235 líneas),
  `ClientePortal` (870 → 103), `Dashboard` (525 → 146), `Vehiculos` (496 → 102),
  `Ordenes` (461 → 102) y `Register` (419 → 294). Ningún archivo pasa de 400 líneas.
- ✅ `npm run lint` sin errores (había 12).
- ✅ Arreglos de paso: los errores de los formularios se ven dentro de la ventana, y
  "marcar revisión DEKRA como hecha" ya no guarda la fecha de mañana después de las 6 p. m.

### Fase 1: qué se hizo (26/09/2026)

- ✅ Respaldo de los datos antes de empezar (`supabase/respaldos/`, fuera de git).
- ✅ Sin cuentas de clientes: se quitaron el rol `cliente` (y sus 3 cuentas de prueba), la
  vinculación cuenta↔ficha, las solicitudes, la fusión de fichas y el bloqueo de clientes.
  Las cuentas nuevas quedan como `pendiente` y no ven nada.
- ✅ Estados del flujo real (cita → … → entregado) con los pasos validados en la base.
  Los viejos pasaron así: Pendiente → en revisión, En proceso → en reparación, Completado → entregado.
- ✅ Datos de cita y recepción, link único por trabajo y respuesta del cliente.
- ✅ Tablas nuevas: ítems del precio, pagos (efectivo, SINPE Móvil o transferencia; de
  contado o en cuotas) e historial de estados. Los costos viejos pasaron a un ítem y los
  trabajos entregados viejos quedaron como pagados de contado.
- ✅ Funciones: ver y responder el trabajo desde el link sin login, avanzar estado,
  regenerar link, tarjetas de Inicio y plata por mes (cobrado, por cobrar y ganancia).
- ✅ `año` → `anio`.

### Pendiente

- En el dashboard de Supabase: apagar el registro público (*Authentication → Sign In /
  Providers → Allow new users to sign up*), activar la protección contra contraseñas
  filtradas y confirmar que la confirmación de correo está activa.
- Probar un trabajo completo (cita → entregado con cuotas) y el link del cliente. Se va a
  hacer con el usuario demo cuando existan las pantallas nuevas; no se prueba escribiendo
  datos a mano en la base real.
- Otras decisiones con el taller: tonos exactos del rojo y el azul, datos del taller para
  la página pública y los mensajes, y si el demo sigue editable (con reinicio nocturno)
  o pasa a solo lectura.
