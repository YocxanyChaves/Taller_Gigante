# Sistema de diseño — "claro y vivo"

Idea: **minimalista, claro y fácil de leer, pero con movimiento.** Fondo hueso, tarjetas blancas con borde suave, un solo color fuerte (el rojo del logo) y la letra **Atkinson Hyperlegible**, hecha para leerse sin esfuerzo. El proceso del carro va con los **colores del semáforo**. Las animaciones le dan el toque divertido: las cosas entran, se levantan, cuentan y celebran.

> **Historial de decisiones de la dueña (26/09/2026):**
> 1. Retro Windows 98 → "demasiado anticuado".
> 2. Vintage moderno → "lo vintage ya vi que no".
> 3. Tecnológico futurista oscuro (vidrio, brillos) → lo cambió por el siguiente.
> 4. **Claro y vivo (actual)**, basado en su lienzo de diseño "Sistema Taller Mecánico" (https://claude.ai/artifact/S2DwQED8oGDUZGdggfEk9h), más semáforo y animaciones pedidas por ella. No volver a temas oscuros, retro ni vintage.
>
> Los tokens reales viven en `src/index.css` (`@theme` de Tailwind y las clases de animación); `/estilos` muestra todo.

## Colores (`@theme`, `src/index.css`)

```css
--color-fondo: #fafaf8;        /* hueso */
--color-tarjeta: #ffffff;
--color-suave: #f1efeb;        /* fondos de íconos, pestañas */
--color-linea: #e4e2de;        /* bordes */
--color-linea-fuerte: #cfcbc4; /* bordes de campos y botones secundarios */
--color-tinta: #1a1a1a;        /* texto principal */
--color-gris: #5f5b55;         /* texto de apoyo (AA sobre blanco) */
--color-rojo: #b3131f;         /* marca: acción principal (hover #8c0e18) */
/* Semáforo (luz / texto AA sobre blanco) */
--color-verde: #1f9d4c;          --color-verde-texto: #17703a;
--color-amarillo: #f2b705;       --color-amarillo-texto: #8a5a00;
--color-semaforo-rojo: #e0262f;  --color-rojo-texto: #b3131f;
```
Sin azul (el logo es rojo y negro). Radios: `rounded-tarjeta` 12px, `rounded-control` 10px.

## Semáforo del proceso (`src/lib/estados.js`, `<Semaforo>`, `<Insignia>`)

- 🟢 **verde:** `listo` (listo para recoger).
- 🟡 **amarillo:** `en_revision`, `en_reparacion` (se está trabajando).
- 🔴 **rojo:** `esperando_aprobacion`, `esperando_repuestos` (detenido, esperando algo). La luz roja **late**.
- ⚫ **apagado (gris):** `cita`, `no_aprobado`, `entregado`, `cancelado`.
Cada estado se muestra con un semaforito de 3 luces (la suya encendida) + el texto del color. Nunca solo el color.

## Letra

- **Atkinson Hyperlegible** 400/700 para todo. Base del sitio **18px** (`html { font-size: 112.5% }`). **Nunca `text-sm`/`text-xs`** (quedan bajo 16px).
- Títulos en negrita, en oración normal ("Carros en el taller"), no en mayúsculas. Solo la clase `.etiqueta` ("PASO 1 DE 3", "PARA HOY") va en mayúscula chiquita.
- Números y plata con `.numeros` (cifras del mismo ancho). Montos: `₡540 mil` en gráficos y tarjetas; `₡540 000` en detalles y cobros.

## Navegación

- **Inicio es un menú:** fecha, saludo según la hora, "¿Qué desea hacer?" y 4 opciones grandes (`<OpcionMenu>`): Recibir un carro (círculo rojo) · Carros en el taller · Buscar un cliente · Cobrar y entregar. Abajo, "Para hoy" con datos reales (`resumen_inicio()`).
- Las demás pantallas: barra de arriba con **"← Inicio"** y el botón rojo **"Recibir un carro"** (en celular, "Recibir"). "Salir" solo en Inicio.
- El gráfico de plata del plan original va en **Cobros** (fase 5), no en Inicio.

## Componentes (`src/components/ui/`)

- **Ventana:** tarjeta blanca, borde `linea`, radio 12px, título en negrita.
- **Botón principal:** rojo, texto blanco, alto ~56px, ícono + texto siempre. Al pasar el mouse se levanta y brilla; al tocar se aprieta; el ícono se menea. Uno solo por pantalla. **Secundario:** blanco con borde; **peligro:** blanco con borde y texto rojo, siempre con `<Confirmar>`; **gris:** como enlace.
- **Campo:** etiqueta en negrita arriba, caja blanca con borde 2px que se oscurece al escribir. `grande` para el dato principal de un paso (placa, teléfono: letra de 40px).
- **Placa:** la placa dibujada como placa (borde negro, letras separadas).
- **TarjetaNumero:** número grande que **cuenta hacia arriba** al aparecer (`useContar`, con respaldo por temporizador).
- **Asistente:** barra roja de 6px arriba que se llena, "PASO X DE Y", pregunta grande; cada paso entra deslizándose (derecha al avanzar, izquierda al volver). "Atrás" como enlace gris, "Siguiente" rojo.
- **Confeti:** estallido al terminar algo importante (carro recibido, carro entregado), junto con una palomita que se dibuja.
- **Confirmar:** ventanita blanca que aparece con un pequeño rebote sobre fondo oscurecido.
- **Vacio:** borde punteado, ícono que flota, qué hacer.

## Movimiento (clases en `src/index.css`)

`animar-entrada` (sube y aparece; `--retraso` para escalonar listas), `deslizar-derecha`/`-izquierda`, `aparecer`, `oscurecer`, `latido`, `flotar`, `menear` (en `.group:hover`), `dibujar`, `confeti`, `barra-progreso`. Cada pantalla entra con `animar-entrada` al cambiar de ruta. **Todo se apaga con `prefers-reduced-motion`.** El movimiento acompaña, nunca estorba: nada que haya que esperar para poder tocar.

## Gráfico de plata (Chart.js, fase 5, en Cobros)

- Tres **líneas** por mes: Cobrado (`--color-tinta`, continua, puntos cuadrados), Por cobrar (`--color-rojo`, rayada 10/6, puntos circulares), Ganancia (`--color-verde`, punteada 3/5, puntos triangulares). Grosor 3px, `tension .3`, animación de entrada de Chart.js.
- **Cada punto con su monto escrito encima** (`₡540`), 14px del color de la línea.
- Eje Y en pasos de `₡100 mil`; cuadrícula `--color-linea`; sin cuadrícula vertical; leyenda propia en HTML (tarjetas arriba del gráfico con su valor actual).
- Tooltip: fondo blanco, borde `--color-linea`, radio 10px, sombra suave.
- Si la ganancia es aproximada, un asterisco con "*Faltan costos de algunos repuestos".

## Accesibilidad (el usuario es un señor mayor)

Contraste AA mínimo; áreas tocables ≥ 48px; todo ícono lleva texto; nada que dependa de hover; nada que dependa solo del color (semaforito + texto en estados, patrones en líneas); mensajes de error en español claro que digan cómo arreglarlo; confirmaciones con el nombre de la cosa ("¿Cancelar el trabajo del Toyota Hilux BTR-482?"); nunca más de un botón rojo por pantalla; diseño responsivo (tablet, compu y celular).
