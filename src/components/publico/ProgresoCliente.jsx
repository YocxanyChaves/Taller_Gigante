import { Check } from "lucide-react";
import { fechaLarga } from "../../lib/formato";

// Los pasos del carro contados para el cliente: lo hecho con palomita verde,
// el paso actual con su luz del semáforo latiendo y lo que falta en gris.
// Siempre en vertical. Con `animado` (en la ficha del taller), al abrirse se
// van marcando uno por uno, de arriba hacia abajo, hasta llegar al de ahora:
// cada círculo se llena, la palomita se dibuja y la línea baja hasta el
// siguiente.

const PASOS = [
  "Recibimos su carro",
  "Lo estamos revisando",
  "Esperamos su respuesta",
  "Lo estamos arreglando",
  "Listo para recoger",
];

// En qué paso va cada estado (5 = todo terminado).
const POSICION = {
  en_revision: 1,
  esperando_aprobacion: 2,
  esperando_repuestos: 3,
  en_reparacion: 3,
  listo: 4,
  entregado: 5,
};

const LUZ_ACTUAL = {
  1: "bg-amarillo",
  2: "bg-semaforo-rojo latido",
  3: "bg-amarillo",
  4: "bg-verde",
};

// Cada cuánto se marca el siguiente paso.
const PAUSA = 380;

export default function ProgresoCliente({ trabajo, animado = false }) {
  const posicion = POSICION[trabajo.estado];
  if (posicion === undefined) return null;

  // Historial: la fecha en que empezó cada paso (si la hay).
  const fechaDe = (i) => {
    const estados = Object.keys(POSICION).filter((e) => POSICION[e] === i);
    return trabajo.historial?.find((h) => estados.includes(h.estado))?.fecha;
  };

  const circulo = animado ? "size-11" : "size-8";
  const mitad = animado ? "left-[21px]" : "left-[15px]";

  return (
    <ol className={animado ? "mx-auto flex w-full max-w-xl flex-col" : "flex flex-col"}>
      {PASOS.map((texto, i) => {
        const hecho = i < posicion;
        const actual = i === posicion;
        const fecha = i === 0 ? trabajo.fecha_ingreso : fechaDe(i);
        const textoActual = actual && trabajo.estado === "esperando_repuestos" ? "Esperando los repuestos" : texto;
        // Cuándo se marca este paso (y cuándo baja la línea al siguiente).
        const marca = `${i * PAUSA + 200}ms`;
        const baja = `${i * PAUSA + 200 + PAUSA * 0.45}ms`;

        return (
          <li
            key={texto}
            style={{ "--retraso": `${i * (animado ? PAUSA : 90)}ms` }}
            className={`animar-entrada relative flex last:pb-0 ${animado ? "gap-5 pb-9" : "gap-4 pb-6"}`}
          >
            {i < PASOS.length - 1 && (
              <>
                <span
                  aria-hidden="true"
                  className={`absolute ${animado ? "top-11 h-[calc(100%-2.75rem)] w-1" : "top-8 h-[calc(100%-1.5rem)] w-0.5"} ${mitad} ${animado ? "-ml-[1px]" : ""} bg-linea`}
                />
                {hecho && (
                  <span
                    aria-hidden="true"
                    style={animado ? { animationDelay: baja } : undefined}
                    className={`absolute ${animado ? "linea-llenar top-11 h-[calc(100%-2.75rem)] w-1 -ml-[1px]" : "top-8 h-[calc(100%-1.5rem)] w-0.5"} ${mitad} bg-verde`}
                  />
                )}
              </>
            )}
            <span
              aria-hidden="true"
              style={animado && (hecho || actual) ? { animationDelay: marca } : undefined}
              className={
                `relative grid ${circulo} shrink-0 place-items-center rounded-full ` +
                (hecho
                  ? `bg-verde text-white ${animado ? "paso-marcar" : ""}`
                  : actual
                    ? `${LUZ_ACTUAL[i]} ring-4 ring-tinta/10 ${animado ? "paso-marcar" : ""}`
                    : "border-2 border-linea-fuerte bg-tarjeta")
              }
            >
              {hecho && (
                <Check
                  size={animado ? 24 : 18}
                  strokeWidth={3}
                  className={animado ? "palomita-marcar" : ""}
                  style={animado ? { animationDelay: `calc(${marca} + 150ms)` } : undefined}
                />
              )}
            </span>
            <div className={animado ? "pt-1.5" : "pt-0.5"}>
              <p
                className={`${animado ? "text-xl" : "text-lg"} ${actual ? "font-bold" : hecho ? "" : "text-gris"}`}
              >
                {textoActual}
                {animado && actual && <span className="etiqueta ml-2">· Ahora</span>}
                <span className="sr-only">{hecho ? " (hecho)" : actual ? " (ahora)" : " (falta)"}</span>
              </p>
              {(hecho || actual) && fecha && (
                <p className="text-base text-gris first-letter:uppercase">{fechaLarga(fecha, true)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
