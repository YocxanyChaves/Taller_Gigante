import { ESTADOS } from "../../lib/estados";
import { fechaLarga } from "../../lib/formato";
import Desplegable from "../ui/Desplegable";

// Por dónde ha pasado el carro, del más viejo al más nuevo. El último punto
// es el estado actual y lleva el color de su luz del semáforo.

const COLOR_LUZ = {
  verde: "bg-verde",
  amarillo: "bg-amarillo",
  rojo: "bg-semaforo-rojo",
};

export default function LineaTiempo({ historial }) {
  const ultimo = historial.at(-1);
  return (
    <Desplegable
      titulo="Por dónde ha pasado"
      resumen={ultimo ? `Ahora: ${ESTADOS[ultimo.estado]?.texto ?? ultimo.estado}` : null}
    >
      <ol className="p-6">
        {historial.map((h, i) => {
          const actual = i === historial.length - 1;
          const luz = ESTADOS[h.estado]?.luz;
          return (
            <li
              key={h.id}
              style={{ "--retraso": `${i * 60}ms` }}
              className="animar-entrada relative flex gap-4 pb-6 last:pb-0"
            >
              {!actual && <span aria-hidden="true" className="absolute top-5 left-[9px] h-full w-0.5 bg-linea" />}
              <span
                aria-hidden="true"
                className={`relative mt-1 size-5 shrink-0 rounded-full border-4 border-tarjeta ${
                  actual ? `${COLOR_LUZ[luz] ?? "bg-tinta"} ring-2 ring-tinta/15` : "bg-linea-fuerte"
                }`}
              />
              <div>
                <p className={`text-lg ${actual ? "font-bold" : ""}`}>{ESTADOS[h.estado]?.texto ?? h.estado}</p>
                <p className="text-base text-gris">{fechaLarga(h.created_at, true)}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Desplegable>
  );
}
