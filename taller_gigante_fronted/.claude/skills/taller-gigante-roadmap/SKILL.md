---
name: taller-gigante-roadmap
description: Hoja de ruta para ordenar y mejorar el sistema "Taller Mecánico Gigante" (React + Vite + Tailwind + Supabase), por fases. Úsala SIEMPRE que se trabaje en este proyecto — refactorizar, agregar funciones, tocar la base de datos, el portal de clientes, órdenes, cotizaciones, pagos, fotos, invitaciones, recordatorios, DEKRA o la página pública — aunque la persona no mencione la hoja de ruta ni las fases.
---

# Taller Gigante — hoja de ruta de mejoras

Sistema de gestión para un taller mecánico real (el taller del tío de la dueña del proyecto), que además es proyecto de portafolio.

## La meta (úsala como filtro para cada decisión)

1. El taller lo usa todos los días para **recibir carros, dar seguimiento y cobrar**.
2. El cliente ve **cómo va su carro sin tener que llamar**.
3. El rol **demo** muestra todo funcionando, con datos enmascarados, para el portafolio.

Si una función no sirve a ninguno de esos tres puntos, probablemente no hace falta.

## Estado actual (resumen)

- Frontend: React + Vite + Tailwind. Backend: Supabase, proyecto `TallerMecánicoGigante` (id `kwaurgcbtjesaswmladd`), Postgres 17. Los ids de las tablas son `bigint` identity.
- Roles: `admin` (todo, cambia roles), `demo` (sandbox: lee y escribe solo filas `es_demo = true`), `cliente` (solo lo suyo, entra a `/portal`). La función `get_my_role()` devuelve el rol y la usan todas las políticas. Todo registro nuevo es `cliente`; el trigger `proteger_rol_usuario` protege los roles.
- Tablas: `usuarios`, `clientes`, `vehiculos`, `ordenes`, `solicitudes_vinculacion`.
- Ficha de cliente ≠ cuenta de usuario. Hoy se vinculan de dos formas: automática al registrarse (`handle_new_user`, por correo/teléfono, **insegura**) y por solicitud + aprobación del admin + fusión (`fusionar_cliente_vinculado`).
- Órdenes: Pendiente → En proceso → Completado. Historial por cliente/placa. Dashboard con ingresos y gráfico semanal.
- `lib/dekra.js`: calcula el mes de revisión técnica según el último dígito de la placa y alerta 15 días antes.
- Problemas conocidos: README es la plantilla de Vite; `Clientes.jsx` (~1200 líneas) y `ClientePortal.jsx` (~900) son gigantes; el rol se consulta en 4 lugares (App, Sidebar, Topbar, Dashboard); la lógica de Supabase no está versionada en el repo.

## ⚠️ Primero lo primero: arreglos urgentes de Supabase

Antes de cualquier fase, lee `references/supabase-arreglos.md`, sección A. Hay dos huecos de seguridad en producción:
1. **Cualquiera puede registrarse como admin** (el rol se toma de la metadata del registro).
2. **Cualquiera que sepa el teléfono de un cliente puede ver sus datos** (vinculación automática por teléfono no verificado).

Propón la migración de la sección A apenas empiece la sesión, aunque te pidan otra cosa, y explica el riesgo en una línea. El resto de ese archivo (B–F) se reparte entre la fase 0 y la fase 1, como indica `references/fases.md`.

## Cómo trabajar con esta skill

- **Una fase a la vez.** Antes de empezar, pregunta en qué fase estamos (o revísalo en el README si ya existe la sección "Hoja de ruta"). No mezcles fases.
- **Lee antes de cambiar.** Revisa el código y el esquema real de Supabase antes de proponer cambios; este resumen puede estar desactualizado.
- **Propón, luego ejecuta.** Al inicio de cada fase, muestra un plan corto (archivos, migraciones, riesgos) y espera el visto bueno.
- **Nada destructivo sin confirmar.** Borrar tablas, columnas, funciones o datos, o cambiar valores de estados existentes, requiere confirmación explícita. Siempre mediante migración, nunca a mano en el dashboard.
- **Todo cambio de base de datos es una migración** en `supabase/migrations/` con nombre descriptivo, e incluye sus políticas RLS.
- **Seguridad primero:** cada tabla nueva lleva RLS desde el día uno (cliente ve solo lo suyo, demo solo lectura, admin todo). Prueba las políticas con los tres roles.
- **No romper el demo:** cada pantalla o dato nuevo debe verse bien con el rol demo, con datos enmascarados (fotos incluidas: usa un placeholder).
- **Commits pequeños** por cambio lógico, mensajes en español y claros.
- **Cierra cada fase** actualizando el README (qué se hizo y qué sigue) y listando pendientes.
- Estilo de la interfaz: mantén el look actual; nada de rediseños que no se pidieron.

## Las fases

El detalle de cada fase (tareas, modelo de datos, criterios de "listo") está en `references/fases.md`. Léelo al empezar cualquier fase. La auditoría de la base de datos está en `references/supabase-arreglos.md`.

| Fase | Objetivo | En pocas palabras |
|---|---|---|
| 0 | Ordenar la casa | Arreglos de seguridad y rendimiento en Supabase, README real, `useAuth` único, partir archivos gigantes, migraciones al repo |
| 1 | Núcleo del taller | Recepción del vehículo, orden con ítems, estados reales, pagos |
| 2 | Portal del cliente | Invitación por link (reemplaza solicitudes + fusión), aprobar cotización, ver fotos |
| 3 | Retención y visibilidad | Recordatorios de mantenimiento, PDF de la orden, página pública |
| 4 | Extras | Inventario de repuestos, mecánico asignado, reportes |

## Decisiones pendientes (preguntar antes de tocarlas)

Estas dependen de lo que el tío realmente necesita. No las implementes ni las borres sin preguntar:

- ¿El rol **demo** sigue siendo sandbox editable (con reinicio nocturno de datos) o pasa a solo lectura?
- ¿Qué pasa con la **placa duplicada** `DSF456` y con kilometrajes dudosos como `500000 KM`?
- ¿Se renombra la columna **`año` → `anio`**?
- ¿Se elimina **bloquear cliente**? (propuesta: sí, casi no se usa en un taller pequeño)
- ¿Se quita que el **cliente agregue vehículos** desde el portal? (propuesta: sí, que lo haga el taller)
- Nombres finales de los **estados** y si todos aplican.
- ¿Hay **más de un mecánico**? (define si la fase 4 incluye asignación)
- Métodos de pago que usa el taller (efectivo, SINPE Móvil, tarjeta, transferencia).

## Fuera de alcance

- **Factura electrónica de Hacienda:** no se integra; el taller usa su propio facturador. El sistema genera un comprobante interno (PDF) que no es factura.
- **Mensajes automáticos por WhatsApp API:** tiene costo por mensaje. Usar links `wa.me` (gratis) y correo para notificaciones.
