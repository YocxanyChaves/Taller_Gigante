import { useState } from "react";
import Dialogo from "../ui/Dialogo";
import Boton from "../ui/Boton";
import { LLEGADA_VACIA, datosLlegada, llegadaLista } from "../../lib/llegada";
import CamposLlegada from "./CamposLlegada";

// "Ya llegó el carro": cómo llegó (ver CamposLlegada); con "Guardar" el carro
// pasa a revisión. Arranca en la unidad que ya se sabe del carro.

export default function DialogoLlegada({ abierto, unidad = "km", guardando, error, alGuardar, alCerrar }) {
  const [valores, setValores] = useState({ ...LLEGADA_VACIA, unidad });
  const lista = llegadaLista(valores);

  return (
    <Dialogo
      abierto={abierto}
      titulo="Llegó el carro"
      alCerrar={alCerrar}
      alEnviar={() => lista && alGuardar(datosLlegada(valores))}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando || !lista}>
            {guardando ? "Guardando…" : "Guardar y pasar a revisión"}
          </Boton>
        </>
      }
    >
      <p>Anote lo que marca el tablero. La gasolina y las notas son opcionales.</p>
      <div className="mt-5">
        <CamposLlegada valores={valores} alCambiar={(cambio) => setValores((v) => ({ ...v, ...cambio }))} />
        {error && <p role="alert" className="mt-5 text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
