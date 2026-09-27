# Pantallas

Reglas comunes: título grande que dice qué es la pantalla, una frase de ayuda debajo, el botón rojo "+ Nuevo trabajo" siempre visible, estados vacíos que explican qué hacer ("Todavía no hay carros en el taller. Toque «Nuevo trabajo» para agregar el primero.").

## Asistente "Nuevo trabajo" (un paso por pantalla, barra de progreso "Paso 2 de 4")

1. **¿Cuál es el teléfono del cliente?** (8 dígitos, teclado numérico). Si existe → muestra "Es don Carlos Pérez" + [Sí, es él] [No, es otra persona]. Si no existe → pide solo el nombre.
2. **¿Cuál es la placa?** Si el cliente ya tiene carros, los muestra como botones grandes + "Otro carro". Carro nuevo: placa obligatoria; marca, modelo y año opcionales.
3. **¿Qué le pasa al carro?** Texto libre grande, con ejemplos en gris.
4. **¿Cuándo viene?** Botones: [Ya está aquí] [Hoy] [Mañana] [Escoger fecha]. "Ya está aquí" crea el trabajo directo en `en_revision`.
Final: resumen + [Guardar trabajo]. Botón "Atrás" siempre visible; nunca se pierde lo escrito.

## Trabajos (tablero)

Columnas o bloques por etapa, en orden del flujo, con contador: Citas · En revisión · Esperando respuesta · Esperando repuestos · En reparación · Listos para recoger. Cada tarjeta: placa grande, carro, cliente, cuántos días lleva en esa etapa (resaltar en rojo si pasa de 3 días esperando respuesta). En celular: lista agrupada por etapa. Entregados/no aprobados no aparecen aquí (van al historial del cliente).

## Ficha del trabajo

Arriba: placa, carro, cliente (con botón de llamar/WhatsApp), estado en insignia grande.
Centro: **el botón de siguiente paso**, grande, rojo, con una frase de qué pasa al tocarlo:

| estado | botón | qué hace |
|---|---|---|
| cita | Ya llegó el carro | pide km y combustible (opcional) → en_revision |
| en_revision | Anotar diagnóstico y precio | abre la cotización |
| (cotización lista) | Mandar precio por WhatsApp | abre WhatsApp + copiar → esperando_aprobacion |
| esperando_aprobacion | El cliente respondió… | [Aprobó] [No aprobó] (por si respondió por teléfono) |
| esperando_repuestos | Ya llegaron los repuestos | → en_reparacion |
| en_reparacion | El carro está listo | → listo + ofrece avisar por WhatsApp |
| listo | Entregar y cobrar | contado o cuotas, primer pago → entregado |
| no_aprobado | Se llevó el carro | cobro de revisión opcional → entregado |

Debajo: línea de tiempo de estados, cotización (tabla simple), pagos. Acciones secundarias (editar, cancelar, regenerar link) en botones grises al final, con confirmación.

## Cotización

Filas: tipo (Repuesto / Mano de obra / Otro, como botones), descripción, cantidad, precio. Campo opcional "Me costó" solo en repuestos, con ayuda: "Solo para calcular su ganancia. El cliente no lo ve." Total grande abajo, en vivo.

## Mensajes de WhatsApp (plantillas, con datos reales)

- **Cotización:** "Hola {nombre}, le saluda Taller Gigante. Ya revisamos su {marca} placa {placa}. Diagnóstico: {diagnóstico}. Total: ₡{total} ({desglose corto}). Puede ver el detalle y responder aquí: {link}"
- **Listo:** "Hola {nombre}, su {marca} placa {placa} ya está listo para recoger. Total: ₡{total}. Detalle: {link}"
- **Recordatorio de cobro:** "Hola {nombre}, le recordamos que queda un saldo de ₡{saldo} por el trabajo de su {marca} placa {placa}. Detalle: {link}. ¡Gracias!"
Teléfono normalizado a `506` + 8 dígitos. Texto con `encodeURIComponent`. Siempre dos botones: [Abrir WhatsApp] [Copiar mensaje] (con aviso "Copiado").

## Cobros

Arriba: tarjetas Cobrado este mes · Por cobrar · Ganancia del mes (cuentan hacia arriba) y el gráfico de plata (ver `diseno.md`) con selector [Últimos 6 meses] [Este año]. Debajo:
Lista de quién debe: cliente, carro, saldo grande, desde cuándo, último abono. Botones: [Registrar abono] (monto + método, sugiere el saldo) [Recordar por WhatsApp]. Total por cobrar arriba.

## Inicio (hecho en la fase 2)

1. Fecha, saludo según la hora y "¿Qué desea hacer?".
2. Menú de 4 opciones grandes: Recibir un carro (rojo) · Carros en el taller · Buscar un cliente · Cobrar y entregar.
3. "Para hoy": carros listos para recoger, clientes que no han respondido el precio y (fase 5) carros por pasar DEKRA, cada uno con su semaforito.
Nada más. Las tarjetas de plata y el gráfico van en Cobros.

## Clientes

Un buscador grande (nombre, teléfono o placa). Ficha: datos, carros, historial por carro, saldo, [Nuevo trabajo para este cliente].

## Página pública del cliente `/t/:token`

Pensada para celular. Nombre del taller, "Hola {nombre}", carro y placa, línea de tiempo grande del estado, diagnóstico, detalle y total. Si espera respuesta: [Sí, hágale] (rojo) [No, gracias] (gris) + comentario opcional + confirmación. Saldo si hay. Botón [Escribir al taller por WhatsApp]. Mismo diseño que el sistema.
