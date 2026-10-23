import { useState } from "react";
import { cambiarProximoPago } from "../../services/cobros";
import { mensajeError } from "../../lib/errores";
import Dialogo from "../ui/Dialogo";
import Boton from "../ui/Boton";
import { CampoProximoPago } from "./ProximoPago";

// "Cambiar la fecha del próximo pago" de un trabajo en cuotas. En blanco, se
// quita la fecha. Se monta de nuevo cada vez que se abre.

export default function DialogoProximoPago({ ordenId, dia, alCerrar, alGuardado }) {
  const [valor, setValor] = useState(dia ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      await cambiarProximoPago(ordenId, valor);
      await alGuardado();
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      abierto
      titulo="Próximo pago"
      alCerrar={alCerrar}
      alEnviar={guardar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar la fecha"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-4 text-tinta">
        <CampoProximoPago valor={valor} alCambiar={setValor} ayuda="Si la deja en blanco, se quita la fecha." />
        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
