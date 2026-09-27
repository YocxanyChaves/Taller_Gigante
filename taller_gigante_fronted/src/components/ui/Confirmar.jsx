import { useEffect, useRef } from "react";
import Boton from "./Boton";

// Pregunta antes de hacer algo que no se puede deshacer. El mensaje nombra la
// cosa ("¿Cancelar el trabajo del Hyundai ABC123?"). Empieza con el foco en
// "No", para que un Enter sin querer no borre nada. Escape también cancela.

export default function Confirmar({
  abierto,
  titulo,
  children,
  textoConfirmar = "Sí, continuar",
  textoCancelar = "No, volver",
  peligro = false,
  cargando = false,
  alConfirmar,
  alCancelar,
}) {
  const refCancelar = useRef(null);

  useEffect(() => {
    if (!abierto) return;
    refCancelar.current?.focus();
    const alTecla = (e) => {
      if (e.key === "Escape") alCancelar();
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto, alCancelar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby="confirmar-mensaje"
        className="vidrio w-full max-w-lg overflow-hidden"
      >
        <h2
          id="confirmar-titulo"
          className="rotulo flex items-center gap-3 border-b border-white/[0.06] px-6 py-4 text-base text-texto-2"
        >
          <span aria-hidden="true" className={`luz size-2 shrink-0 ${peligro ? "bg-rojo-vivo text-rojo-vivo" : "bg-azul-vivo text-azul-vivo"}`} />
          {titulo}
        </h2>
        <div id="confirmar-mensaje" className="p-6 text-lg text-texto">
          {children}
        </div>
        <div className="flex flex-col-reverse gap-4 border-t border-white/[0.06] p-6 sm:flex-row sm:justify-end">
          <Boton ref={refCancelar} variante="secundario" onClick={alCancelar}>
            {textoCancelar}
          </Boton>
          <Boton variante={peligro ? "peligro" : "principal"} onClick={alConfirmar} disabled={cargando}>
            {cargando ? "Un momento…" : textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}
