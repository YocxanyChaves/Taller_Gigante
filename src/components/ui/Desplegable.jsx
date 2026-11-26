import { createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";

// Tarjeta que se abre y se cierra tocando el título, para que la página no
// sea tan larga. Cerrada sigue diciendo qué tiene (`resumen`) y lleva escrito
// «Ver» u «Ocultar»: nada queda escondido sin aviso.
//
// Dentro de un <GrupoDesplegables> se portan como un menú en cuadrícula: cada
// una es un cuadro (con su emoji) y lo de adentro se abre a todo el ancho
// JUSTO DEBAJO de la fila del cuadro que se tocó; las filas de abajo bajan
// junto con lo desplegado. Solo una abierta a la vez.
// Cómo: cada cuadro y su panel son hijos de la misma cuadrícula; a los cuadros
// se les pone `order` según su lugar (0, 2, 4…) y al panel abierto el número
// impar que va después del último cuadro de su fila.

const Grupo = createContext(null);

export function GrupoDesplegables({ children, etiqueta }) {
  const [abierto, setAbierto] = useState(null);
  const [ordenPanel, setOrdenPanel] = useState(0);
  const cuadricula = useRef(null);

  const cuadros = () => [...(cuadricula.current?.querySelectorAll(":scope > [data-cuadro]") ?? [])];

  // Después del último cuadro de la fila del que está abierto.
  const calcularOrden = useCallback((id) => {
    const lista = cuadros();
    const i = lista.findIndex((el) => el.getAttribute("aria-controls") === id);
    if (i < 0) return 0;
    const columnas = getComputedStyle(cuadricula.current).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
    const finDeFila = Math.min(Math.floor(i / columnas) * columnas + columnas - 1, lista.length - 1);
    return finDeFila * 2 + 1;
  }, []);

  // Cada cuadro en su lugar (algunos no se muestran, así que se cuenta en pantalla).
  useLayoutEffect(() => {
    cuadros().forEach((el, i) => (el.style.order = String(i * 2)));
  });

  // Si cambia el ancho (cambian las columnas), el panel se vuelve a acomodar.
  useEffect(() => {
    if (!abierto) return;
    const acomodar = () => setOrdenPanel(calcularOrden(abierto));
    window.addEventListener("resize", acomodar);
    return () => window.removeEventListener("resize", acomodar);
  }, [abierto, calcularOrden]);

  const alternar = (id) => {
    if (abierto === id) {
      setAbierto(null);
      return;
    }
    setOrdenPanel(calcularOrden(id));
    setAbierto(id);
  };

  return (
    <Grupo.Provider value={{ abierto, alternar, ordenPanel }}>
      <div ref={cuadricula} role="group" aria-label={etiqueta} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
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
          data-cuadro
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => {
            grupo.alternar(id);
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
        {abierto && (
          <section
            id={id}
            aria-label={titulo}
            style={{ order: grupo.ordenPanel }}
            className="aparecer col-span-full scroll-mt-24 rounded-tarjeta border-2 border-rojo bg-tarjeta shadow-elevada"
          >
            <header className="flex items-center justify-between gap-4 border-b border-linea px-6 py-4">
              <h3 className="flex items-center gap-3 text-2xl font-bold">
                {emoji && <span aria-hidden="true">{emoji}</span>}
                {titulo}
              </h3>
              <button
                type="button"
                onClick={() => grupo.alternar(id)}
                className="flex min-h-12 items-center gap-2 rounded-control px-3 text-lg font-bold text-gris transition-colors hover:bg-suave hover:text-tinta"
              >
                <X aria-hidden="true" size={22} />
                Cerrar
              </button>
            </header>
            {children}
          </section>
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
