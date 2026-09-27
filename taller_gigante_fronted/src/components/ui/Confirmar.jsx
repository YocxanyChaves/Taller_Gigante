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
    <div className="oscurecer fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4 backdrop-blur-sm">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        aria-describedby="confirmar-mensaje"
        className="aparecer w-full max-w-lg rounded-tarjeta bg-tarjeta shadow-elevada"
      >
        <h2 id="confirmar-titulo" className="px-6 pt-6 text-2xl font-bold">
          {titulo}
        </h2>
        <div id="confirmar-mensaje" className="px-6 pt-3 pb-6 text-lg text-gris">
          {children}
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-linea p-5 sm:flex-row sm:justify-end">
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
