import { Camera } from "lucide-react";
import { ESTADOS } from "../../lib/estados";
import { fechaLarga } from "../../lib/formato";
import { fotosPorEtapa, textoFotos } from "../../lib/etapas";
import Desplegable from "../ui/Desplegable";
import Galeria from "../ui/Galeria";

// Por dónde ha pasado el carro, del más viejo al más nuevo, con las fotos y
// videos que se tomaron en cada etapa. El último punto es el estado actual y lleva el
// color de su luz del semáforo.

const COLOR_LUZ = {
  verde: "bg-verde",
  amarillo: "bg-amarillo",
  rojo: "bg-semaforo-rojo",
};

export default function LineaTiempo({ historial, fotos = [] }) {
  const etapas = fotosPorEtapa(
    historial.map((h) => ({ ...h, fecha: h.created_at })),
    fotos
  );
  const ultimo = etapas.at(-1);
  const resumen = [
    ultimo && `Ahora: ${ESTADOS[ultimo.estado]?.texto ?? ultimo.estado}`,
    fotos.length > 0 && textoFotos(fotos),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Desplegable titulo="Por dónde ha pasado" resumen={resumen || null}>
      <ol className="p-6">
        {etapas.map((h, i) => {
          const actual = i === etapas.length - 1;
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
              <div className="min-w-0 flex-1">
                <p className={`text-lg ${actual ? "font-bold" : ""}`}>{ESTADOS[h.estado]?.texto ?? h.estado}</p>
                <p className="text-base text-gris">{fechaLarga(h.created_at, true)}</p>
                {h.fotos.length > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 flex items-center gap-1.5 text-base text-gris">
                      <Camera aria-hidden="true" size={18} />
                      {textoFotos(h.fotos)}
                    </p>
                    <Galeria fotos={h.fotos} />
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Desplegable>
  );
}
