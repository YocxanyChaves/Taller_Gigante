# Sistema de diseño — "tecnológico de otro mundo"

Idea: **un panel de mando futurista.** Fondo espacial casi negro con dos luces grandes de la marca (roja arriba a la izquierda, azul abajo a la derecha) y una cuadrícula fina que se desvanece. Paneles de **vidrio translúcido** (desenfoque del fondo, borde de luz de 1px, sombra profunda), esquinas redondeadas, **brillos** rojos y azules solo en lo importante (botón principal, números, luces de estado). Tono varonil, sobrio y tecnológico. Nada pastel, nada "de Pinterest".

> **Historial de decisiones de la dueña (26/09/2026):**
> 1. Retro Windows 98 (degradado en barras, sombras negras de 6px, bordes de 2px, franja rojo/negro): "demasiado anticuado".
> 2. Vintage moderno (plano, bordes finos, cuadritos): "lo vintage ya vi que no".
> 3. **Tecnológico futurista (actual).** No volver a lo retro/vintage.
>
> Los tokens reales viven en `src/index.css` (`@theme` de Tailwind + clases `.vidrio`, `.luz`, `.numero-brillo`, `.latido`, `.rotulo`); `/estilos` muestra todo.

## Colores (`@theme`, `src/index.css`)

```css
--color-fondo: #05070d;        /* casi negro, con luces roja/azul y cuadrícula */
--color-panel: #0f1522;
--color-panel-hundido: #0a0f19;
--color-linea: #1f2a3f;
--color-acero: #8a96ab;        /* texto de apoyo, íconos */
--color-texto: #f1f5fb;
--color-texto-2: #aeb9cc;
--color-rojo: #e02a33;         /* marca (el logo es rojo): acción principal, urgente, por cobrar */
--color-rojo-vivo: #ff4d57;
--color-azul: #2563eb;         /* secundario (el logo no tiene azul): navegación, en proceso */
--color-azul-vivo: #4f9dff;    /* cobrado, enlaces, foco */
--color-cromo: #e8eef7;        /* ganancia, "listo" */
```
Radios: `--radius-panel` 1.25rem (paneles) y `--radius-control` 0.875rem (botones, campos). Sombras: `shadow-panel`, `shadow-brillo-rojo`, `shadow-brillo-azul`.
Rojo = principal; azul = solo secundario (decidido por la dueña). Si llegan los tonos exactos, cambiar rojo/azul y sus "vivo".

## Letras

- Títulos y etiquetas cortas (clase `.rotulo`): **Chakra Petch** 600, MAYÚSCULAS, `letter-spacing: .08em` (futurista pero legible).
- Texto normal y botones: **Barlow** 500; base del sitio **18px** (`html { font-size: 112.5% }`). **Nunca `text-sm`/`text-xs`** (quedan bajo 16px).
- Números y plata: **JetBrains Mono** 500, con `.numero-brillo` en tarjetas.
- Montos: `₡540 mil` en gráficos y tarjetas; `₡540 000` en detalles y cobros.

## Componentes (`src/components/ui/`)

- **Ventana:** `.vidrio` + título con una luz roja encendida (`.luz`) y texto `.rotulo`. Sin botones falsos de minimizar/cerrar.
- **Botón principal:** degradado rojo-vivo → rojo, brillo rojo, radio control, alto ~56px, ícono + texto siempre; al tocar se encoge un poco (`scale .97`). Uno solo por pantalla.
- **Secundario:** vidrio azul con borde azul-vivo; **peligro:** vidrio rojo con texto rojo, siempre con `<Confirmar>`; **gris:** vidrio neutro.
- **Campo:** etiqueta arriba siempre visible, caja oscura translúcida; al escribir se enciende en azul (borde + halo). Error debajo con ícono.
- **Tarjeta de número:** vidrio con una luz del color del dato asomándose en la esquina y el número brillando.
- **Insignia de estado:** píldora con luz de color + texto. Activos azul, esperando respuesta rojo (la luz late), listo cromo, terminado acero.
- **Asistente:** "Paso X de Y", un punto encendido por paso y barra azul con brillo.
- **Navegación:** panel lateral de vidrio flotante; sección activa con fondo azul degradado y una rayita azul encendida. En celular, barra de vidrio flotante abajo con "Nuevo" en rojo.
- **Login:** tarjeta con borde de luz rojo→azul y cuatro esquinas encendidas tipo visor; luz verde "En línea".
- Animaciones mínimas y siempre apagadas con `prefers-reduced-motion`.

## Gráfico de plata (Chart.js)

- Tres **líneas** por mes: Cobrado (`--azul-vivo`, continua, puntos cuadrados), Por cobrar (`--rojo-vivo`, rayada 10/6, puntos circulares), Ganancia (`--cromo`, punteada 3/5, puntos triangulares). Grosor 3px, `tension .3`.
- **Cada punto con su monto escrito encima** (`₡540`), en mono 13px del color de la línea.
- Brillo suave: `shadowBlur` 8–10 con el color de la línea (solo aquí).
- Eje Y en `₡100 mil` pasos; cuadrícula `#18243a`; sin cuadrícula vertical; leyenda propia en HTML (tarjetas arriba del gráfico hacen de leyenda con su valor actual).
- Tooltip: fondo `--color-fondo`, borde 1px `--color-azul-vivo`, radio 0.
- Si la ganancia es aproximada, un asterisco con "*Faltan costos de algunos repuestos".

## Accesibilidad (el usuario es un señor mayor)

Contraste AA mínimo; áreas tocables ≥ 48px; todo ícono lleva texto; nada que dependa de hover; nada que dependa solo del color (patrones en líneas, texto en insignias); mensajes de error en español claro que digan cómo arreglarlo; confirmaciones con el nombre de la cosa ("¿Cancelar el trabajo del Hyundai ABC123?"); nunca más de un botón rojo por pantalla; diseño responsivo (el tío puede usarlo en el celular).
