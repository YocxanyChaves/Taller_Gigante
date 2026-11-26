import { createContext, useContext, useId, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X } from "lucide-react";

// Tarjeta que se abre y se cierra tocando el título, para que la página no
// sea tan larga. Cerrada sigue diciendo qué tiene (`resumen`) y lleva escrito
// «Ver» u «Ocultar»: nada queda escondido sin aviso.
//
// Dentro de un <GrupoDesplegables> se portan como un menú: cada una es un
// botón (con su emoji) y lo de adentro se abre ABAJO de todos los botones, a
// todo el ancho. Solo una abierta a la vez: abrir otra cierra la anterior.

const Grupo = createContext(null);

export function GrupoDesplegables({ children, etiqueta }) {
  const [abierto, setAbierto] = useState(null);
  const [destino, setDestino] = useState(null);

  return (
    <Grupo.Provider value={{ abierto, setAbierto, destino }}>
      <div role="group" aria-label={etiqueta} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
      <div ref={setDestino} className="scroll-mt-24" />
    </Grupo.Provider>
  );
}

export default function Desplegable({ titulo, resumen, emoji, abiertoAlInicio = false, children }) {
  const grupo = useContext(Grupo);
  const [abiertoSolo, setAbiertoSolo] = useState(abiertoAlInicio);
  const id = useId();

  if (grupo) {
    const abierto = grupo.abierto === id;
    return (
      <>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => {
            grupo.setAbierto(abierto ? null : id);
            if (!abierto) {
              requestAnimationFrame(() =>
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" })
              );
            }
          }}
          className={
            "chip-menu flex min-h-24 w-full items-center gap-4 rounded-tarjeta border-2 px-5 py-4 text-left " +
            (abierto ? "border-rojo bg-rojo/5 shadow-elevada" : "border-linea bg-tarjeta hover:border-rojo")
          }
        >
          {emoji && (
            <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-suave text-2xl">
              {emoji}
            </span>
          )}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-xl font-bold">{titulo}</span>
            {resumen && <span className="text-base text-gris">{resumen}</span>}
          </span>
          <span className={`flex shrink-0 items-center gap-1 text-base font-bold ${abierto ? "text-rojo" : "text-gris"}`}>
            {abierto ? "Abierto" : "Ver"}
            <ChevronDown
              aria-hidden="true"
              size={22}
              strokeWidth={2.4}
              className={`transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
            />
          </span>
        </button>
        {abierto &&
          grupo.destino &&
          createPortal(
            <section
              id={id}
              aria-label={titulo}
              className="aparecer mt-6 rounded-tarjeta border-2 border-rojo bg-tarjeta shadow-elevada"
            >
              <header className="flex items-center justify-between gap-4 border-b border-linea px-6 py-4">
                <h3 className="flex items-center gap-3 text-2xl font-bold">
                  {emoji && <span aria-hidden="true">{emoji}</span>}
                  {titulo}
                </h3>
                <button
                  type="button"
                  onClick={() => grupo.setAbierto(null)}
                  className="flex min-h-12 items-center gap-2 rounded-control px-3 text-lg font-bold text-gris transition-colors hover:bg-suave hover:text-tinta"
                >
                  <X aria-hidden="true" size={22} />
                  Cerrar
                </button>
              </header>
              {children}
            </section>,
            grupo.destino
          )}
      </>
    );
  }

  const abierto = abiertoSolo;
  return (
    <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
      <h2>
        <button
          type="button"
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbiertoSolo((a) => !a)}
          className={`flex min-h-16 w-full items-center gap-4 rounded-tarjeta px-6 py-4 text-left transition-colors hover:bg-suave ${
            abierto ? "rounded-b-none border-b border-linea" : ""
          }`}
        >
          {emoji && (
            <span aria-hidden="true" className="text-2xl">
              {emoji}
            </span>
          )}
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
