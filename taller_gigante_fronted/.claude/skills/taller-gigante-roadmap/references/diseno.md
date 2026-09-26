# Sistema de diseño — "vintage moderno de taller"

Idea: **un homenaje a las computadoras viejas (Windows 95/98), no una copia.** De ellas quedan las esquinas rectas, el orden y el minimalismo, las etiquetas en mayúscula tipo rótulo, un cuadrito de color en el título de las ventanas y la barra de progreso en bloques. Todo lo demás es **plano y actual**: bordes de 1px, sombras cortas, sin degradados, sin campos "hundidos", sin franjas de advertencia. Tono **varonil, sobrio y de taller**. Nada pastel, nada redondeado, nada "de Pinterest".

> **Decisión de la dueña (26/09/2026):** la primera versión (barras con degradado, sombras negras de 6px, bordes de 2px, franja rojo/negro) se veía "demasiado anticuada". No volver a ese estilo. Los tokens reales viven en `src/index.css` (`@theme` de Tailwind); `/estilos` muestra todo.

## Colores (tokens en `@theme`, `src/index.css`)

```css
--color-fondo: #0b0f17;         /* azul marino casi negro, con cuadrícula de puntos tenue */
--color-panel: #121824;         /* ventanas */
--color-panel-hundido: #0e131d; /* fondo de los campos */
--color-linea: #232e42;         /* bordes (1px) */
--color-acero: #8792a6;         /* texto de apoyo, íconos */
--color-texto: #eef2f8;
--color-texto-2: #aab5c8;
--color-rojo: #d7262e;          /* marca (el logo es rojo): acción principal, urgente, por cobrar */
--color-rojo-vivo: #ff4d4d;     /* rojo sobre fondo oscuro para números/líneas */
--color-azul: #1f5fe0;          /* secundario (el logo no tiene azul): navegación, en proceso */
--color-azul-vivo: #4b93ff;     /* cobrado, enlaces, foco */
--color-cromo: #e6ebf2;         /* ganancia, "listo" */
```
Rojo = principal; azul = solo secundario (decidido por la dueña). Si llegan los tonos exactos, cambiar solo `--color-rojo` y `--color-azul`.

## Letras

- Títulos y etiquetas cortas (clase `.rotulo`): **Barlow Condensed** 600, MAYÚSCULAS, `letter-spacing: .05em`.
- Texto normal y botones: **Barlow** 500; base del sitio **18px** (`html { font-size: 112.5% }`), nunca menos de 16px.
- Números y plata: **JetBrains Mono** 500.
- Montos: `₡540 mil` en gráficos y tarjetas; `₡540 000` en detalles y cobros.

## Componentes (`src/components/ui/`)

- **Ventana:** fondo panel, borde 1px línea, sombra `4px 4px 0` casi negra, radio 0. Título: fila con borde inferior, cuadrito rojo de 10px + texto `.rotulo` gris claro. **Sin botones falsos de minimizar/cerrar.**
- **Botón primario:** rojo plano, texto blanco, sombra `3px 3px 0`, alto mínimo ~56px, ícono + texto siempre. Al tocar se hunde 2px. Uno solo por pantalla.
- **Secundario:** transparente con borde azul-vivo; **peligro:** borde y texto rojo, siempre con `<Confirmar>`; **gris:** sin sombra, para acciones de poco uso.
- **Campo:** etiqueta arriba siempre visible, caja plana `panel-hundido` con borde 1px, foco con borde azul-vivo + anillo suave. Error debajo con ícono.
- **Tarjeta de número:** panel con borde 1px, rayita de 32px arriba con el color del dato, etiqueta `.rotulo`, número grande mono.
- **Insignia de estado:** rectángulo sin redondeo, fondo tenue del color, cuadrito de color + texto `.rotulo`. Activos azul, esperando respuesta y por cobrar rojo, listo cromo, terminado acero.
- **Asistente:** "Paso X de Y" + barra de progreso en 20 bloques (el homenaje más claro).
- **Navegación activa:** rayita azul de 4px al lado (compu) o arriba (celular) y fondo azul tenue.

## Gráfico de plata (Chart.js)

- Tres **líneas** por mes: Cobrado (`--azul-vivo`, continua, puntos cuadrados), Por cobrar (`--rojo-vivo`, rayada 10/6, puntos circulares), Ganancia (`--cromo`, punteada 3/5, puntos triangulares). Grosor 3px, `tension .3`.
- **Cada punto con su monto escrito encima** (`₡540`), en mono 13px del color de la línea.
- Brillo suave: `shadowBlur` 8–10 con el color de la línea (solo aquí).
- Eje Y en `₡100 mil` pasos; cuadrícula `#18243a`; sin cuadrícula vertical; leyenda propia en HTML (tarjetas arriba del gráfico hacen de leyenda con su valor actual).
- Tooltip: fondo `--color-fondo`, borde 1px `--color-azul-vivo`, radio 0.
- Si la ganancia es aproximada, un asterisco con "*Faltan costos de algunos repuestos".

## Accesibilidad (el usuario es un señor mayor)

Contraste AA mínimo; áreas tocables ≥ 48px; todo ícono lleva texto; nada que dependa de hover; nada que dependa solo del color (patrones en líneas, texto en insignias); mensajes de error en español claro que digan cómo arreglarlo; confirmaciones con el nombre de la cosa ("¿Cancelar el trabajo del Hyundai ABC123?"); nunca más de un botón rojo por pantalla; diseño responsivo (el tío puede usarlo en el celular).
