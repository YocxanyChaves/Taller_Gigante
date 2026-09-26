# Sistema de diseño — "retrofuturista de taller"

Idea: **las formas de Windows 98 con la actitud de hoy.** Ventanas cuadradas con barra de título, bordes gruesos, sombra dura sin difuminar, campos "hundidos". Pero con letra moderna, colores fuertes de la marca (rojo y azul) y un toque de brillo solo en los gráficos. Tono **varonil, sobrio y de taller**: acero, metal, contraste alto. Nada pastel, nada redondeado, nada "de Pinterest".

## Colores (tokens en `:root`)

```css
--fondo: #0a0f1a;        /* azul marino casi negro */
--panel: #101828;        /* ventanas */
--panel-hundido: #0c1322;/* campos y cajas hundidas */
--linea: #22314d;        /* bordes */
--acero: #8b97ab;        /* texto de apoyo, íconos */
--texto: #eef2f8;
--texto-2: #aeb9cc;
--rojo: #d7262e;         /* marca: acción principal, alertas, por cobrar */
--rojo-vivo: #ff4040;    /* rojo sobre fondo oscuro para números/lineas */
--azul: #1f5fe0;         /* marca: navegación, secundario */
--azul-vivo: #3b8bff;    /* cobrado, enlaces */
--cromo: #e6ebf2;        /* ganancia, detalles "metálicos" */
--sombra: #000;
```
Barra de título de ventana: `linear-gradient(90deg, var(--rojo), #6b1f3f 45%, var(--azul))` — el único degradado del sistema.
Si la dueña manda los tonos exactos de la marca, cambiar solo `--rojo` y `--azul`.

## Letras

- Títulos y etiquetas cortas: **Barlow Condensed** 600, MAYÚSCULAS, `letter-spacing: .04em` (se ve industrial, tipo placa de taller).
- Texto normal y botones: **Barlow** 500, tamaño base **18px** (nunca menos de 16px).
- Números y plata: **JetBrains Mono** 500.
- Montos: `₡540 mil` en gráficos y tarjetas; `₡540 000` en detalles y cobros.

## Componentes

- **Ventana:** fondo `--panel`, borde 2px `--linea`, sombra `6px 6px 0 var(--sombra)`, esquinas rectas (radio 0). Barra de título con el degradado, texto en mayúscula condensada. **Sin botones falsos de minimizar/cerrar** (confunden al tío).
- **Botón primario:** fondo `--rojo`, texto blanco, borde 2px negro, sombra dura `4px 4px 0 #000`, alto mínimo 56px, ícono + texto siempre. Al tocar: se "hunde" (`translate(2px,2px)` y sombra 2px). Uno solo por pantalla.
- **Botón secundario:** fondo `--panel`, borde 2px `--azul`, mismo relieve. **Peligro:** borde rojo, texto rojo, siempre con confirmación.
- **Campo:** etiqueta arriba siempre visible (no solo placeholder), caja hundida (`--panel-hundido`, `box-shadow: inset 2px 2px 0 #05080f`), alto 52px, foco con borde `--azul-vivo` 2px.
- **Tarjeta de número:** caja hundida, etiqueta en mayúscula condensada, número grande en mono (28–32px) con el color de su dato.
- **Insignia de estado:** rectángulo sin redondeo, texto en mayúscula condensada; colores: activos en azul, esperando respuesta y por cobrar en rojo, listo en cromo, entregado en acero.
- **Detalle de taller (con moderación):** franja diagonal de advertencia rojo/negro de 6px como separador en el login y encima del botón de siguiente paso. Nada más decorativo.

## Gráfico de plata (Chart.js)

- Tres **líneas** por mes: Cobrado (`--azul-vivo`, continua, puntos cuadrados), Por cobrar (`--rojo-vivo`, rayada 10/6, puntos circulares), Ganancia (`--cromo`, punteada 3/5, puntos triangulares). Grosor 3px, `tension .3`.
- **Cada punto con su monto escrito encima** (`₡540`), en mono 13px del color de la línea.
- Brillo suave: `shadowBlur` 8–10 con el color de la línea (solo aquí).
- Eje Y en `₡100 mil` pasos; cuadrícula `#18243a`; sin cuadrícula vertical; leyenda propia en HTML (tarjetas arriba del gráfico hacen de leyenda con su valor actual).
- Tooltip: fondo `--fondo`, borde 2px `--azul-vivo`, radio 0.
- Si la ganancia es aproximada, un asterisco con "*Faltan costos de algunos repuestos".

## Accesibilidad (el usuario es un señor mayor)

Contraste AA mínimo; áreas tocables ≥ 48px; todo ícono lleva texto; nada que dependa de hover; nada que dependa solo del color (patrones en líneas, texto en insignias); mensajes de error en español claro que digan cómo arreglarlo; confirmaciones con el nombre de la cosa ("¿Cancelar el trabajo del Hyundai ABC123?"); nunca más de un botón rojo por pantalla; diseño responsivo (el tío puede usarlo en el celular).
