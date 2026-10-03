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

> **Ojo:** el frontend se está rehaciendo. Ya están el login, la estructura y las piezas
> de diseño (fase 2); las pantallas de Inicio, Trabajos, Clientes y Cobros se llenan en
> las fases 3 a 6. El sistema viejo sigue en la rama `main`.

## Estructura

```
src/
├─ pages/            una pantalla por ruta (Login, Inicio, Trabajos, Clientes, Cobros, Estilos…)
├─ services/         consultas a Supabase por pantalla
├─ components/
│  ├─ ui/            piezas del sistema de diseño: Ventana, Boton, Campo, Placa, Semaforo,
│  │                 Insignia, TarjetaNumero, OpcionMenu, Asistente, Confirmar, Confeti y
│  │                 Vacio (todas se ven en /estilos)
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

## Hoja de ruta

**Plan nuevo (26/09/2026):** la base de datos se queda (se limpia y se amplía) y el
frontend se hace de nuevo en la rama `v2`, con un flujo y un diseño nuevos. Los
clientes ya no tienen cuenta: cada trabajo tiene un link único donde ven cómo va
su carro y aprueban o rechazan el precio. Los avisos se mandan por WhatsApp con
el mensaje ya escrito. El plan completo está en `.claude/skills/taller-gigante-roadmap/`.

| Fase | Objetivo | Estado |
|---|---|---|
| 0 | Seguridad y limpieza de la base de datos | ✅ Hecha |
| 1 | Modelo de datos nuevo: estados del taller, ítems, pagos, historial y link público | ✅ Hecha |
| 2 | Base del frontend nuevo: diseño, componentes, estructura y login | ✅ Hecha |
| 3 | Trabajos: asistente "Recibir un carro", lista de carros y botón de siguiente paso | ✅ Hecha |
| 4 | Link del cliente y WhatsApp | 🟨 Falta probarla desde un celular |
| 5 | Cobros (contado o cuotas) y el dashboard "Cómo va el taller" con el gráfico de plata | ⬜ |
| 6 | Clientes: buscador y ficha | 🟨 Falta probarla en el navegador con el demo |
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

### Fase 2: qué se hizo (26/09/2026)

- ✅ Frontend viejo borrado (sigue en la rama `main`); login nuevo y pantalla para cuentas `pendiente`.
- ✅ Diseño "claro y vivo" aprobado por la dueña (después de probar retro, vintage y futurista):
  fondo hueso, letra Atkinson Hyperlegible, rojo del logo, semáforo para el proceso del carro y
  animaciones. Todas las piezas en `/estilos`.
- ✅ Inicio como menú "¿Qué desea hacer?" con "Para hoy" (datos reales de `resumen_inicio()`).

### Fase 3: qué se hizo (27/09/2026)

- ✅ Asistente "Recibir un carro": empieza por la placa (si el carro ya vino, se salta el
  teléfono y los datos del carro), busca mientras se escribe y guarda cliente, carro y trabajo
  de una sola vez (`recibir_carro()`). Termina con confeti.
- ✅ "Carros en el taller": lista con pestañas por color del semáforo y cuántos días lleva cada
  carro en su etapa (en rojo si lleva más de 3 días esperando respuesta).
- ✅ Ficha del trabajo: botón rojo de siguiente paso (llegó el carro, anotar precio, ya le avisé el
  precio, el cliente respondió, llegaron los repuestos, el carro está listo), precio con
  repuestos, mano de obra y "Me costó", línea de tiempo, volver un paso y cancelar.

### Fase 4: qué se hizo (27/09/2026)

- ✅ Página del cliente `/t/<token>`, sin cuenta y pensada para celular: cómo va su carro (pasos
  con palomitas y la luz del semáforo), lo que tiene y cuánto cuesta, y "Sí, hágale" / "No, gracias"
  con confirmación (confeti si aprueba). Botón para escribirle al taller por WhatsApp.
- ✅ WhatsApp gratis (wa.me) con el mensaje ya escrito y "Copiar mensaje": "Mandar precio por
  WhatsApp" (luego "Ya lo mandé" y el carro queda esperando respuesta) y aviso de "listo".
- ✅ Sección "Link del cliente" en la ficha: mandarlo, copiarlo, verlo o hacer uno nuevo.
- ✅ La ficha y la lista se actualizan solas (cada 20 y 60 segundos y al volver a la pestaña).
- ⚠️ El WhatsApp del taller es temporal: el número de la dueña (`src/lib/taller.js`).

### Fase 6: qué se hizo (03/10/2026)

Se hizo antes que la fase 5 porque no depende de ella.

- ✅ "Buscar un cliente": un solo campo que busca mientras se escribe, por nombre (sin importar
  tildes), teléfono o placa (o parte de ellos). Sin texto muestra los últimos clientes. Cada
  resultado dice sus placas, cuánto debe y si tiene carros en el taller. Lo buscado se mantiene
  al volver de la ficha.
- ✅ Ficha del cliente `/clientes/<id>`: llamar, WhatsApp, lo que debe, sus carros con el
  historial de trabajos de cada uno, y "Cambiar datos" (nombre, teléfono, correo, dirección).
- ✅ "Recibir un carro de este cliente" y "Recibir este carro": el asistente ya trae el cliente
  o la placa y no pregunta de quién es el carro.
- ✅ En la ficha del trabajo, el nombre del cliente lleva a su ficha.
- Función nueva en la base: `buscar_clientes()` (ver `supabase/README.md`).
- Sin botón de borrar clientes (decisión: casi no se usa y es peligroso).
- Los abonos desde la ficha llegan con la fase 5.

### Pendiente

- Probar la fase 4 desde un celular con el usuario demo: mandar el precio por WhatsApp, abrir el
  link en el celular, aprobar y ver que la ficha cambia sola a "Esperando repuestos" o "En reparación".
- Probar la fase 6 con el usuario demo: buscar por nombre, teléfono y placa, abrir la ficha,
  cambiar un dato y recibir un carro desde la ficha.
- Hacer la guía de uso del sistema (pantalla "¿Cómo se usa?" y versión para imprimir) antes de publicarlo.
- Publicar el sistema (Vercel, gratis) para que los links le abran al cliente fuera de la casa.
- Cambiar el WhatsApp del taller por el número real (`src/lib/taller.js`).
- En el dashboard de Supabase: activar la protección contra contraseñas filtradas si algún día
  se pasa al plan Pro (en el plan gratis no existe) y dejar contraseñas largas en las 2 cuentas.
- El demo todavía puede, llamando a la API a mano, colgar un carro o un trabajo nuevo de un
  cliente real si adivina su id (las políticas no revisan el dueño). Cerrarlo antes de publicar
  las credenciales demo.
- Otras decisiones con el taller: tonos exactos del rojo, datos del taller para
  la página pública y los mensajes, y si el demo sigue editable (con reinicio nocturno)
  o pasa a solo lectura.
