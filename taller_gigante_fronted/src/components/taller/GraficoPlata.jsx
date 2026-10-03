import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
} from "chart.js";
import { formatoColones, formatoColonesCorto, mesCorto } from "../../lib/formato";

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

// El gráfico de la plata: tres líneas por mes. Además del color, cada línea
// tiene su trazo y la forma de sus puntos, así se distinguen aunque la
// persona no vea bien los colores (y en blanco y negro):
//   Cobrado    — negro, continua, cuadrados
//   Por cobrar — rojo, rayada, círculos
//   Ganancia   — verde, punteada, triángulos
// Encima de cada punto va su monto (con 7 meses o más, solo en el último para
// que no se amontonen). Al pasar el mouse o tocar, una cajita con los tres.

const SERIES = [
  { clave: "cobrado", texto: "Cobrado", linea: "--color-tinta", letra: "--color-tinta", trazo: [], punto: "rect" },
  { clave: "porCobrar", texto: "Por cobrar", linea: "--color-rojo", letra: "--color-rojo-texto", trazo: [10, 6], punto: "circle" },
  { clave: "ganancia", texto: "Ganancia", linea: "--color-verde", letra: "--color-verde-texto", trazo: [3, 5], punto: "triangle" },
];

const token = (nombre) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
const LETRA = "'Atkinson Hyperlegible', system-ui, sans-serif";

// Escribe el monto encima de cada punto. Si dos montos del mismo mes quedan
// muy cerca, los separa para que no se monten.
const montosEncima = {
  id: "montosEncima",
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const meses = chart.data.labels.length;
    const soloUltimo = meses > 6;
    ctx.save();
    ctx.font = `bold 15px ${LETRA}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    for (let i = 0; i < meses; i++) {
      if (soloUltimo && i !== meses - 1) continue;
      const etiquetas = chart.data.datasets
        .map((ds, d) => {
          const punto = chart.getDatasetMeta(d).data[i];
          const valor = ds.data[i];
          return punto && valor > 0 ? { x: punto.x, y: punto.y - 10, texto: formatoColonesCorto(valor), color: ds.colorLetra } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.y - b.y);
      for (let k = 1; k < etiquetas.length; k++) {
        if (etiquetas[k].y - etiquetas[k - 1].y < 18) etiquetas[k].y = etiquetas[k - 1].y + 18;
      }
      for (const e of etiquetas) {
        ctx.fillStyle = e.color;
        ctx.fillText(e.texto, e.x, e.y);
      }
    }
    ctx.restore();
  },
};

export default function GraficoPlata({ meses }) {
  const lienzo = useRef(null);

  useEffect(() => {
    const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const maximo = Math.max(0, ...meses.flatMap((m) => SERIES.map((s) => m[s.clave])));

    const grafico = new Chart(lienzo.current, {
      type: "line",
      data: {
        labels: meses.map((m) => mesCorto(m.mes)),
        datasets: SERIES.map((s) => {
          const color = token(s.linea);
          return {
            label: s.texto,
            data: meses.map((m) => m[s.clave]),
            borderColor: color,
            backgroundColor: color,
            colorLetra: token(s.letra),
            borderWidth: 3,
            borderDash: s.trazo,
            tension: 0.3,
            pointStyle: s.punto,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: reducir ? false : { duration: 900 },
        layout: { padding: { top: 64, right: 24, left: 8 } },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            grid: { display: false },
            border: { color: token("--color-linea-fuerte") },
            ticks: { color: token("--color-gris"), font: { family: LETRA, size: 16 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: token("--color-linea") },
            border: { display: false },
            ticks: {
              color: token("--color-gris"),
              font: { family: LETRA, size: 16 },
              // Pasos de ₡100 mil mientras quepan; si la plata es más, que Chart.js escoja.
              stepSize: maximo <= 800_000 ? 100_000 : undefined,
              maxTicksLimit: 9,
              callback: (v) => formatoColonesCorto(v),
            },
          },
        },
        plugins: {
          tooltip: {
            backgroundColor: "#fff",
            borderColor: token("--color-linea"),
            borderWidth: 1,
            cornerRadius: 10,
            padding: 14,
            titleColor: token("--color-tinta"),
            bodyColor: token("--color-tinta"),
            titleFont: { family: LETRA, size: 17, weight: "bold" },
            bodyFont: { family: LETRA, size: 16 },
            usePointStyle: true,
            boxPadding: 6,
            callbacks: {
              title: (items) => {
                const m = meses[items[0].dataIndex];
                const [anio, mes] = m.mes.split("-").map(Number);
                const texto = new Date(anio, mes - 1, 1)
                  .toLocaleString("es-CR", { month: "long", year: "numeric" })
                  .replace("septiembre", "setiembre");
                return texto.charAt(0).toUpperCase() + texto.slice(1);
              },
              label: (item) => {
                const aprox = item.dataset.label === "Ganancia" && meses[item.dataIndex].aproximada ? "*" : "";
                return ` ${item.dataset.label}: ${formatoColones(item.parsed.y)}${aprox}`;
              },
            },
          },
        },
      },
      plugins: [montosEncima],
    });

    return () => grafico.destroy();
  }, [meses]);

  return (
    <div className="flex flex-col gap-4">
      <Leyenda />
      <div className="relative h-96 w-full">
      <canvas
        ref={lienzo}
        role="img"
        aria-label="Gráfico de cobrado, por cobrar y ganancia por mes. Los mismos números están en la tabla de abajo."
      />
      </div>
    </div>
  );
}

// Leyenda en HTML: una muestra de cada línea (color, trazo y forma del punto)
// con su nombre en letra normal.
function Leyenda() {
  return (
    <ul aria-label="Qué es cada línea" className="flex flex-wrap gap-x-6 gap-y-2 text-lg">
      {SERIES.map((s) => (
        <li key={s.clave} className="flex items-center gap-2">
          <svg aria-hidden="true" width="44" height="16" viewBox="0 0 44 16">
            <line
              x1="2" y1="8" x2="42" y2="8"
              stroke={`var(${s.linea})`}
              strokeWidth="3"
              strokeDasharray={s.trazo.join(" ") || undefined}
            />
            <Punto forma={s.punto} color={`var(${s.linea})`} />
          </svg>
          {s.texto}
        </li>
      ))}
    </ul>
  );
}

function Punto({ forma, color }) {
  const borde = { fill: color, stroke: "#fff", strokeWidth: 2 };
  if (forma === "rect") return <rect x="16" y="2" width="12" height="12" {...borde} />;
  if (forma === "triangle") return <polygon points="22,1 29,14 15,14" {...borde} />;
  return <circle cx="22" cy="8" r="6" {...borde} />;
}
