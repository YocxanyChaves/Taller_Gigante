// Efecto «venom»: al pasar el mouse por el `.venom-activador`, una masa viva
// del color `--venom-color` nace del botón (centro abajo de la `.venom-zona`),
// estira tentáculos que se mueven solos y se funden entre sí (filtro "goo"),
// y cubre toda la zona; debajo laten unas venas más oscuras. Al quitar el
// mouse se recoge de vuelta hacia el botón.
//
// <MasaVenom /> va adentro de la zona (detrás del contenido).
// <CapaVenom> es una copia del texto en otro color (blanco), recortada con un
// círculo que crece al mismo ritmo que la masa: así cada letra cambia de
// color justo cuando la masa le pasa por encima, al entrar y al salir.
// <FiltroVenom /> define el filtro una sola vez (va en el Marco).
// Todo en src/index.css («Efecto venom»).

// Tentáculos: tamaño (en % del ancho de la zona), hacia dónde se estiran,
// cuándo salen y cuánto dura su vaivén. Desordenados a propósito.
const GOTAS = [
  { t: "34cqw", dx: "-70%", dy: "-95%", d: "0s", v: "0.5s", a: "2.6s" },
  { t: "26cqw", dx: "95%", dy: "-80%", d: "0.04s", v: "0.55s", a: "3.3s" },
  { t: "42cqw", dx: "-120%", dy: "-15%", d: "0.08s", v: "0.62s", a: "3.9s" },
  { t: "22cqw", dx: "140%", dy: "-35%", d: "0s", v: "0.45s", a: "2.2s" },
  { t: "30cqw", dx: "15%", dy: "-140%", d: "0.02s", v: "0.5s", a: "2.9s" },
  { t: "18cqw", dx: "-160%", dy: "-110%", d: "0.1s", v: "0.6s", a: "1.9s" },
];

const VENAS = [
  { t: "30cqw", x: "18%", y: "30%", dx: "40%", dy: "25%", a: "5.5s" },
  { t: "24cqw", x: "75%", y: "20%", dx: "-50%", dy: "35%", a: "6.8s" },
  { t: "36cqw", x: "55%", y: "80%", dx: "-30%", dy: "-40%", a: "7.6s" },
];

export function MasaVenom() {
  return (
    <>
      <span aria-hidden="true" className="venom-masa">
        <span className="venom-gota venom-principal" />
        {GOTAS.map((g, i) => (
          <span
            key={i}
            className="venom-gota"
            style={{ "--t": g.t, "--dx": g.dx, "--dy": g.dy, "--d": g.d, "--v": g.v, "--a": g.a }}
          />
        ))}
      </span>
      <span aria-hidden="true" className="venom-venas">
        {VENAS.map((v, i) => (
          <span
            key={i}
            className="venom-vena"
            style={{ "--t": v.t, "--x": v.x, "--y": v.y, "--dx": v.dx, "--dy": v.dy, "--a": v.a }}
          />
        ))}
      </span>
    </>
  );
}

export function CapaVenom({ className = "", children }) {
  return (
    <div aria-hidden="true" className={`venom-capa ${className}`}>
      {children}
    </div>
  );
}

export function FiltroVenom() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <filter id="venom-goo" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="borroso" />
        <feColorMatrix in="borroso" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
      </filter>
    </svg>
  );
}
