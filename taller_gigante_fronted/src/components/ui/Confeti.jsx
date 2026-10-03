// Estallido de confeti para celebrar (trabajo guardado, carro entregado).
// Solo CSS; se pone encima de lo que celebra y se va solo.

const COLORES = ["#b3131f", "#f2b705", "#1f9d4c", "#1a1a1a", "#e0262f"];
const PEDAZOS = 28;

// Posiciones fijas (no aleatorias) para que se vea igual cada vez.
const piezas = Array.from({ length: PEDAZOS }, (_, i) => {
  const angulo = (i / PEDAZOS) * Math.PI * 2;
  const distancia = 110 + ((i * 37) % 90);
  return {
    x: `${Math.round(Math.cos(angulo) * distancia)}px`,
    y: `${Math.round(Math.sin(angulo) * distancia - 40)}px`,
    giro: `${(i * 97) % 540}deg`,
    color: COLORES[i % COLORES.length],
    ancho: i % 3 === 0 ? 6 : 9,
  };
});

export default function Confeti() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 z-10">
      {piezas.map((p, i) => (
        <span
          key={i}
          className="confeti absolute block rounded-sm"
          style={{
            width: p.ancho,
            height: 12,
            background: p.color,
            "--x": p.x,
            "--y": p.y,
            "--giro": p.giro,
          }}
        />
      ))}
    </span>
  );
}
