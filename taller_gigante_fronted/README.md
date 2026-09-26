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

| Rol | Entra a | Puede |
|---|---|---|
| `admin` | `/dashboard` | Todo con los datos reales, y cambiar roles en *Usuarios* |
| `demo` | `/dashboard` | Lo mismo que admin, pero solo con datos de prueba (`es_demo = true`), separados de los reales |
| `cliente` | `/portal` | Ver sus carros y órdenes, editar su contacto y agregar vehículos |

Toda cuenta nueva es `cliente`. Los roles admin y demo los asigna un admin.

## Flujo

1. El taller registra al **cliente** (ficha), su **vehículo** y abre una **orden** de trabajo.
2. La orden avanza: `Pendiente → En proceso → Completado`. Las completadas pasan al **Historial**.
3. El **Dashboard** resume vehículos, órdenes, clientes, ingresos del mes y avisa de la
   **revisión técnica (DEKRA)** que se acerca según el último dígito de la placa (`src/lib/dekra.js`).
4. El cliente entra al **portal** y ve el estado de sus carros. Su cuenta se une a su ficha
   del taller con *Clientes → Vincular cuenta* (en la fase 2 se reemplaza por una invitación por link).

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

Cinco tablas: `usuarios`, `clientes`, `vehiculos`, `ordenes` y `solicitudes_vinculacion`.
Una **ficha de cliente** (lo que conoce el taller) es distinta de una **cuenta** (con la que
alguien inicia sesión); se unen con `clientes.user_id`. Detalle completo en
[`supabase/README.md`](supabase/README.md).

## Hoja de ruta

| Fase | Objetivo | Estado |
|---|---|---|
| 0 | Ordenar la casa: seguridad, rendimiento, tipos de datos, código más pequeño y documentación | 🟡 En curso |
| 1 | Núcleo del taller: recepción del carro con fotos, órdenes con ítems, estados reales y pagos | ⬜ |
| 2 | Portal: registro solo por invitación (link por WhatsApp) y aprobar cotizaciones | ⬜ |
| 3 | Retención: recordatorios de mantenimiento, correos, PDF de la orden y página pública | ⬜ |
| 4 | Extras: inventario, mecánicos y reportes (solo si el taller lo pide) | ⬜ |

### Fase 0: qué se hizo (26/09/2026)

- ✅ Cerrados dos huecos de seguridad: registrarse como admin y ver los datos de otro
  cliente registrándose con su teléfono.
- ✅ Esquema de Supabase versionado en `supabase/migrations/` y documentado.
- ✅ Políticas RLS optimizadas e índices nuevos (el linter de Supabase queda sin advertencias de rendimiento).
- ✅ Costos y kilometraje como números, fecha de entrega opcional y placa única.
- ✅ Un solo `useAuth` en lugar de siete consultas de sesión y rol repartidas.
- ✅ `Clientes.jsx` (1183 → 235 líneas) y `ClientePortal.jsx` (870 → 103) partidos en componentes y servicios.

### Pendiente

- Archivos que todavía pasan de ~400 líneas: `Dashboard.jsx`, `Vehiculos.jsx`, `Ordenes.jsx` y `Register.jsx`.
- 11 errores del linter heredados (sobre todo `setState` dentro de `useEffect` y `Math.random` en `ParticleField`).
- Decisiones abiertas con el taller: ¿el demo sigue editable (con reinicio nocturno) o
  pasa a solo lectura?, ¿renombrar la columna `año` → `anio`?, ¿se quita *bloquear cliente*?,
  ¿el cliente puede agregar vehículos desde el portal?, estados finales de las órdenes,
  ¿hay más de un mecánico? y métodos de pago.
- En el dashboard de Supabase: activar la protección contra contraseñas filtradas y
  confirmar que la confirmación de correo está activa.
