---
name: taller-gigante-roadmap
description: Plan completo para reconstruir el sistema "Taller Mecánico Gigante" (React + Vite + Supabase) — flujo del taller, base de datos, diseño retrofuturista rojo/azul y fases de trabajo. Úsala SIEMPRE que se trabaje en este proyecto — base de datos, seguridad, pantallas, componentes, estilos, trabajos/órdenes, cotizaciones, WhatsApp, cobros, cuotas, dashboard, gráfico, clientes, link del cliente, DEKRA — aunque no se mencione el plan ni las fases.
---

# Taller Gigante — plan de reconstrucción

Sistema para el taller mecánico del tío de la dueña del proyecto (Yocxany). También es proyecto de portafolio.

**Decisión tomada:** se conserva la base de datos (se limpia y se amplía) y **el frontend se hace de nuevo**, con un flujo y un diseño nuevos. No remiendes pantallas viejas: constrúyelas nuevas siguiendo este plan y rescata solo la lógica útil (`lib/dekra.js`, cliente de Supabase, cálculo de roles).

## Para quién es (esto manda sobre todo lo demás)

- **El tío:** hombre mayor, acostumbrado a computadoras tipo Windows viejo, poca paciencia con la tecnología. Probablemente usará el sistema poco. Todo tiene que ser obvio.
- **Sus clientes:** no se van a crear una cuenta. Nunca.

Principios de uso (no negociables):
1. **Nada escondido, nada que haya que saber de antemano.** Cada pantalla dice qué hacer. Sin menús ocultos, sin gestos, sin íconos sin texto.
2. **El sistema guía paso a paso.** Formularios de una pregunta a la vez cuando hay más de 3 datos.
3. **Un solo botón grande de "siguiente paso"** en cada trabajo.
4. **Lo mínimo obligatorio:** teléfono del cliente, placa y qué le pasa al carro. Todo lo demás es opcional.
5. **Útil, no extravagante.** Si una función no ayuda a recibir carros, dar seguimiento o cobrar, no va.

## El flujo real del taller

1. **Cita** — el cliente llama o escribe; el tío le dice qué día venir.
2. **En revisión** — el carro llega y el tío lo examina.
3. **Esperando aprobación** — se anota diagnóstico y precio (repuestos + mano de obra) y se le manda al cliente.
   - **No aprobado** → el cliente se lleva el carro. Fin (con cobro de revisión opcional).
4. **Esperando repuestos** — aprobó; se piden los repuestos.
5. **En reparación** — varios días en el taller.
6. **Listo** — se le avisa al cliente.
7. **Entregado** — se entrega y se cobra: **de contado o en cuotas/crédito** (abonos hasta saldar).

## Las decisiones grandes

- **Sin cuentas de clientes.** Solo inician sesión el tío/admin y el demo. Cada trabajo tiene un **link único** (token) que el cliente abre sin registrarse: ve el estado, el diagnóstico, el detalle del precio, y **aprueba o rechaza** ahí mismo. Se eliminan: rol `cliente`, portal con login, `solicitudes_vinculacion`, `fusionar_cliente_vinculado`, vinculación automática, bloqueo de clientes (confirmar cada borrado).
- **WhatsApp gratis:** botón que abre `https://wa.me/506XXXXXXXX?text=<mensaje codificado>` con el mensaje ya escrito (el tío solo da enviar) + botón **"Copiar mensaje"** al lado. Nada de WhatsApp API (cuesta).
- **Pocas pantallas:** Inicio, Trabajos, Clientes, Cobros. Más la página pública del link del cliente y el login.
- **Diseño retrofuturista varonil** con los colores de la empresa (rojo y azul). Ver `references/diseno.md` — obligatorio leerlo antes de tocar cualquier componente o estilo.

## Referencias (léelas cuando toque)

- `references/fases.md` — las fases, en orden, con tareas y criterio de "listo". **Léelo al empezar cualquier sesión.**
- `references/datos.md` — modelo de datos nuevo, estados, link público, pagos, cálculos del dashboard.
- `references/pantallas.md` — qué lleva cada pantalla, el asistente de "Nuevo trabajo", el botón de siguiente paso y los mensajes de WhatsApp.
- `references/diseno.md` — sistema de diseño: colores, letras, componentes, gráfico, accesibilidad.
- `references/supabase-arreglos.md` — auditoría de la base de datos (26/09/2026): huecos de seguridad y datos sucios.

## ⚠️ Primero lo primero

Si la sección A de `references/supabase-arreglos.md` no está aplicada todavía (cualquiera puede registrarse como admin; vinculación por teléfono sin verificar), propón esa migración apenas empiece la sesión, aunque te pidan otra cosa. Explica el riesgo en una línea.

## Cómo trabajar

- **Una fase a la vez**, en el orden de `references/fases.md`. Revisa en el README (sección "Hoja de ruta") en qué fase va el proyecto.
- **Lee antes de cambiar:** el código y el esquema real de Supabase pueden diferir de este plan.
- **Propón, luego ejecuta:** al empezar cada fase, muestra un plan corto (archivos, migraciones, riesgos) y espera el visto bueno.
- **Nada destructivo sin confirmar:** borrar tablas, columnas, funciones, usuarios o datos, o cambiar valores de estados existentes, requiere un sí explícito.
- **Todo cambio de BD es una migración** en `supabase/migrations/`, con RLS desde el día uno y políticas con `(select auth.uid())` / `(select public.get_my_role())`.
- **El demo no se rompe:** cada tabla nueva lleva `es_demo` + trigger `enforce_es_demo_flag`; cada pantalla nueva se prueba con el usuario demo.
- **Trabaja en una rama** (`v2`) hasta que el sistema nuevo cubra lo que hace el viejo.
- **Commits pequeños**, en español, un cambio lógico por commit.
- **Pruebas:** si existe el subagente `tester` en `.claude/agents/`, úsalo al cerrar cada tarea. Nunca pruebes escribiendo en la BD de producción (usa Supabase local o mocks).
- **Cierra cada fase** actualizando el README: qué se hizo, qué sigue, pendientes.
- Habla en español de Costa Rica, sencillo. Textos de la interfaz: cortos, claros, sin jerga ("Carro listo", no "Orden completada").

## Decisiones pendientes (preguntar, no suponer)

- Tonos exactos del rojo y azul del taller (logo o rótulo). Mientras tanto, usar los de `diseno.md`.
- Métodos de pago que usa el taller (propuesta: efectivo, SINPE Móvil, tarjeta, transferencia).
- ¿Se cobra la revisión cuando el cliente no aprueba? ¿Cuánto por defecto?
- Qué hacer con la placa duplicada `DSF456` y kilometrajes dudosos (`500000 KM`).
- Qué pasa con las 2 cuentas de rol `cliente` que existen (propuesta: borrarlas al quitar el rol).
- Nombre y datos del taller para la página pública y los mensajes (nombre, teléfono, dirección, horario).

## Fuera de alcance

- Factura electrónica de Hacienda (el taller usa su facturador; el sistema solo da comprobante interno que dice "no es factura").
- WhatsApp API / mensajes automáticos pagados.
- Cuentas o contraseñas para clientes.
