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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby="confirmar-mensaje"
        className="w-full max-w-lg border-2 border-linea bg-panel shadow-dura"
      >
        <h2 id="confirmar-titulo" className="barra-titulo rotulo px-4 py-2 text-lg text-white">
          {titulo}
        </h2>
        <div id="confirmar-mensaje" className="p-5 text-lg text-texto">
          {children}
        </div>
        <div className="flex flex-col-reverse gap-4 border-t-2 border-linea p-5 sm:flex-row sm:justify-end">
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
