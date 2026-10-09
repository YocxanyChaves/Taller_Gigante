# Taller Mecánico Gigante

Sistema de gestión para un taller mecánico en Costa Rica: recibir carros, dar
seguimiento a las reparaciones y cobrar. Incluye un portal donde cada cliente
ve cómo va su carro sin tener que llamar, y un rol demo para mostrar el
sistema funcionando sin exponer datos reales.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4, React Router e íconos Lucide. Letras
  Atkinson Hyperlegible (instalada, no depende de internet).
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

Para probar desde el celular (mismo Wi-Fi): `npm run dev:celular` y abrir en la compu y en el
celular la dirección "Network" que muestra (por ejemplo `http://192.168.1.12:5173`). Los links
del cliente se arman con la dirección desde la que se abrió el sistema; al publicarlo, se fija
con `VITE_URL_PUBLICA` en el `.env`.

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

## Estructura

```
src/
├─ pages/            una pantalla por ruta (Login, Inicio, Trabajos, Clientes, Cobros…)
├─ services/         consultas a Supabase por pantalla
├─ components/
│  ├─ ui/            piezas del sistema de diseño: Boton, Campo, Placa, Semaforo,
│  │                 Insignia, TarjetaNumero, OpcionMenu, Asistente, Confirmar, Confeti y
│  │                 Vacio
│  └─ layout/        Marco ("← Inicio" y "Recibir un carro" arriba) y Encabezado
├─ context/
│  └─ AuthContext    quién inició sesión y con qué rol → useAuth()
└─ lib/              supabaseClient, estados (semáforo), formato, useContar, errores, dekra
supabase/
├─ migrations/       todos los cambios a la base, en orden
└─ README.md         tablas, funciones, triggers y políticas explicados
```

Convenciones:
- Nadie consulta la sesión o el rol por su cuenta: se usa `useAuth()`.
- Los colores, letras y sombras están como variables en `src/index.css` (`bg-tarjeta`,
  `text-gris`, `bg-verde`…). Nada de colores sueltos en los componentes.
- Todo botón e ícono lleva texto; un solo botón rojo por pantalla.
- Las fechas de los formularios se guardan con `fechaInputAISO` y se leen con
  `isoAFechaInput` (`src/lib/formato.js`); si no, se ven un día antes en Costa Rica.
- Todo cambio a la base es una migración nueva en `supabase/migrations/`, nunca a mano en el dashboard.

## Base de datos

Siete tablas: `usuarios` (cuentas de login), `clientes`, `vehiculos`, `ordenes` (los
trabajos), `orden_items` (detalle del precio), `pagos` y `orden_estados_historial`.
Detalle completo en [`supabase/README.md`](supabase/README.md).
