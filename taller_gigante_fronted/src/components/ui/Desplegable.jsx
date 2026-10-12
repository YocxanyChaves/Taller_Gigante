import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

// Tarjeta que se abre y se cierra tocando el título, para que la página no
// sea tan larga. Cerrada sigue diciendo qué tiene (`resumen`) y lleva escrito
// «Ver» u «Ocultar»: nada queda escondido sin aviso.

export default function Desplegable({ titulo, resumen, abiertoAlInicio = false, children }) {
  const [abierto, setAbierto] = useState(abiertoAlInicio);
  const id = useId();

  return (
    <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
      <h2>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbierto((a) => !a)}
          className={`flex min-h-16 w-full items-center gap-4 rounded-tarjeta px-6 py-4 text-left transition-colors hover:bg-suave ${
            abierto ? "rounded-b-none border-b border-linea" : ""
          }`}
        >
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xl font-bold">{titulo}</span>
            {resumen && <span className="text-base text-gris">{resumen}</span>}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-base font-bold text-gris">
            {abierto ? "Ocultar" : "Ver"}
            <ChevronDown
              aria-hidden="true"
              size={22}
              strokeWidth={2.4}
              className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
            />
          </span>
        </button>
      </h2>
      {abierto && (
        <div id={id} className="aparecer">
          {children}
        </div>
      )}
    </section>
  );
}
