import { useEffect, useRef } from "react";
import Boton from "./Boton";
import Dialogo from "./Dialogo";

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
    if (abierto) refCancelar.current?.focus();
  }, [abierto]);

  return (
    <Dialogo
      abierto={abierto}
      titulo={titulo}
      rol="alertdialog"
      alCerrar={alCancelar}
      pie={
        <>
          <Boton ref={refCancelar} variante="secundario" onClick={alCancelar}>
            {textoCancelar}
          </Boton>
          <Boton variante={peligro ? "peligro" : "principal"} onClick={alConfirmar} disabled={cargando}>
            {cargando ? "Un momento…" : textoConfirmar}
          </Boton>
        </>
      }
    >
      {children}
    </Dialogo>
  );
}
