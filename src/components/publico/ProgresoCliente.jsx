import { Check } from "lucide-react";
import { fechaLarga } from "../../lib/formato";

// Los pasos del carro contados para el cliente: lo hecho con palomita verde,
// el paso actual con su luz del semáforo latiendo y lo que falta en gris.
// Con `ancho` (en la ficha del taller), en pantalla grande los pasos van en
// fila, centrados y a todo lo ancho; en celular siguen uno debajo del otro.

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

export default function ProgresoCliente({ trabajo, ancho = false }) {
  const posicion = POSICION[trabajo.estado];
  if (posicion === undefined) return null;

  // Historial: la fecha en que empezó cada paso (si la hay).
  const fechaDe = (i) => {
    const estados = Object.keys(POSICION).filter((e) => POSICION[e] === i);
    return trabajo.historial?.find((h) => estados.includes(h.estado))?.fecha;
  };

  return (
    <ol className={ancho ? "flex flex-col md:grid md:grid-cols-5 md:gap-2" : "flex flex-col"}>
      {PASOS.map((texto, i) => {
        const hecho = i < posicion;
        const actual = i === posicion;
        const fecha = i === 0 ? trabajo.fecha_ingreso : fechaDe(i);
        const textoActual =
          actual && trabajo.estado === "esperando_repuestos" ? "Esperando los repuestos" : texto;
        return (
          <li
            key={texto}
            style={{ "--retraso": `${i * 90}ms` }}
            className={
              "animar-entrada relative flex gap-4 pb-6 last:pb-0" +
              (ancho ? " md:flex-col md:items-center md:pb-0 md:text-center" : "")
            }
          >
            {i < PASOS.length - 1 && (
              <span
                aria-hidden="true"
                className={
                  `absolute top-8 left-[15px] h-[calc(100%-1.5rem)] w-0.5 ${hecho ? "bg-verde" : "bg-linea"}` +
                  (ancho ? " md:top-[15px] md:left-[calc(50%_+_1.25rem)] md:h-0.5 md:w-[calc(100%_-_2rem)]" : "")
                }
              />
            )}
            <span
              aria-hidden="true"
              className={
                "relative grid size-8 shrink-0 place-items-center rounded-full " +
                (hecho ? "bg-verde text-white" : actual ? `${LUZ_ACTUAL[i]} ring-4 ring-tinta/10` : "border-2 border-linea-fuerte bg-tarjeta")
              }
            >
              {hecho && <Check size={18} strokeWidth={3} />}
            </span>
            <div className={ancho ? "pt-0.5 md:pt-0" : "pt-0.5"}>
              <p className={`text-lg ${actual ? "font-bold" : hecho ? "" : "text-gris"}`}>
                {textoActual}
                <span className="sr-only">{hecho ? " (hecho)" : actual ? " (ahora)" : " (falta)"}</span>
              </p>
              {(hecho || actual) && fecha && <p className="text-base text-gris">{fechaLarga(fecha, true)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
