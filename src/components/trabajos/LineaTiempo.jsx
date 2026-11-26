import { Camera } from "lucide-react";
import { ESTADOS } from "../../lib/estados";
import { fechaLarga } from "../../lib/formato";
import { fotosPorEtapa, textoFotos } from "../../lib/etapas";
import Desplegable from "../ui/Desplegable";
import Galeria from "../ui/Galeria";
import ProgresoCliente from "../publico/ProgresoCliente";

// Por dónde ha pasado el carro. Es el mismo dibujo que ve el cliente en su
// link (todos los pasos, con palomita los hechos y la luz en el de ahora),
// en vertical y centrado, marcándose paso por paso al abrirse; debajo, las fotos y videos de cada etapa. Si el trabajo no
// sigue esos pasos (cita, no aprobó, cancelado), se muestra la lista de
// etapas por las que pasó.

// Los estados que caben en los pasos del cliente.
const CON_PASOS = ["en_revision", "esperando_aprobacion", "esperando_repuestos", "en_reparacion", "listo", "entregado"];

const COLOR_LUZ = {
  verde: "bg-verde",
  amarillo: "bg-amarillo",
  rojo: "bg-semaforo-rojo",
};

export default function LineaTiempo({ historial, fotos = [] }) {
  const etapas = fotosPorEtapa(
    historial.map((h) => ({ ...h, fecha: h.created_at })),
    fotos,
  );
  const ultimo = etapas.at(-1);
  const resumen = [
    ultimo && `Ahora: ${ESTADOS[ultimo.estado]?.texto ?? ultimo.estado}`,
    fotos.length > 0 && textoFotos(fotos),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Desplegable emoji="🛣️" titulo="Por dónde ha pasado" resumen={resumen || null}>
      {ultimo && CON_PASOS.includes(ultimo.estado) ? (
        <div className="flex flex-col gap-8 p-6 sm:p-10">
          <ProgresoCliente
            animado
            trabajo={{
              estado: ultimo.estado,
              fecha_ingreso: etapas[0]?.created_at,
              historial: historial.map((h) => ({ estado: h.estado, fecha: h.created_at })),
            }}
          />
          {fotos.length > 0 && (
            <section className="flex flex-col gap-5 border-t border-linea pt-6">
              <h4 className="flex items-center gap-2 text-xl font-bold">
                <Camera aria-hidden="true" size={22} />
                Fotos de cada paso
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                {etapas
                  .filter((h) => h.fotos.length > 0)
                  .map((h) => (
                    <div key={h.id} className="rounded-tarjeta bg-fondo p-4">
                      <p className="mb-3 text-lg font-bold">
                        {ESTADOS[h.estado]?.texto ?? h.estado}
                        <span className="ml-2 font-normal text-gris">· {textoFotos(h.fotos)}</span>
                      </p>
                      <Galeria fotos={h.fotos} />
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <>
          {/* En celular, la línea va a la izquierda; en pantalla grande, al centro y
          las etapas se turnan a cada lado para usar todo el ancho. */}
          <ol className="relative p-6 sm:p-8">
            <span
              aria-hidden="true"
              className="absolute top-10 bottom-10 left-[34px] w-1 rounded-full bg-linea sm:left-[42px] md:left-1/2 md:-translate-x-1/2"
            />
            {etapas.map((h, i) => {
              const actual = i === etapas.length - 1;
              const luz = ESTADOS[h.estado]?.luz;
              const derecha = i % 2 === 1;
              return (
                <li
                  key={h.id}
                  style={{ "--retraso": `${i * 60}ms` }}
                  className="animar-entrada relative grid grid-cols-[auto_minmax(0,1fr)] gap-4 pb-6 last:pb-0 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-8"
                >
                  <span
                    aria-hidden="true"
                    className={`relative z-10 mt-5 size-6 shrink-0 rounded-full border-4 border-tarjeta md:col-start-2 md:row-start-1 ${
                      actual ? `${COLOR_LUZ[luz] ?? "bg-tinta"} ring-4 ring-tinta/10` : "bg-linea-fuerte"
                    }`}
                  />
                  <div
                    className={`min-w-0 rounded-tarjeta border-2 p-5 md:row-start-1 ${
                      derecha ? "md:col-start-3" : "md:col-start-1 md:text-right"
                    } ${actual ? "border-tinta bg-tarjeta shadow-elevada" : "border-linea bg-fondo"}`}
                  >
                    <p className={`text-xl ${actual ? "font-bold" : ""}`}>
                      {actual && <span className="etiqueta mr-2">Ahora</span>}
                      {ESTADOS[h.estado]?.texto ?? h.estado}
                    </p>
                    <p className="text-base text-gris first-letter:uppercase">{fechaLarga(h.created_at, true)}</p>
                    {h.fotos.length > 0 && (
                      <div className="mt-3 text-left">
                        <p
                          className={`mb-2 flex items-center gap-1.5 text-base text-gris ${derecha ? "" : "md:justify-end"}`}
                        >
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
        </>
      )}
    </Desplegable>
  );
}
