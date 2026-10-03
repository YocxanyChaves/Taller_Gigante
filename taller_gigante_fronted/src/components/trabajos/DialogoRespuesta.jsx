import { useState } from "react";
import { PackageSearch, Wrench, XCircle } from "lucide-react";
import Dialogo from "../ui/Dialogo";
import Eleccion from "../ui/Eleccion";
import Boton from "../ui/Boton";

// "El cliente respondió…" (por teléfono o en persona): aprobó o no. Si
// aprobó, se escoge si hay que esperar repuestos o ya se puede empezar.

const RESPUESTAS = [
  {
    estado: "esperando_repuestos",
    titulo: "Sí, aprobó",
    ayuda: "Hay que pedir repuestos",
    icono: PackageSearch,
  },
  {
    estado: "en_reparacion",
    titulo: "Sí, aprobó",
    ayuda: "Ya puedo empezar a arreglarlo",
    icono: Wrench,
  },
  {
    estado: "no_aprobado",
    titulo: "No aprobó",
    ayuda: "Se va a llevar el carro",
    icono: XCircle,
  },
];

export default function DialogoRespuesta({ abierto, guardando, error, alGuardar, alCerrar }) {
  const [elegido, setElegido] = useState(null);

  return (
    <Dialogo
      abierto={abierto}
      titulo="¿Qué respondió el cliente?"
      alCerrar={alCerrar}
      alEnviar={() => elegido && alGuardar(elegido)}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={!elegido || guardando}>
            {guardando ? "Guardando…" : "Guardar respuesta"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-3 text-tinta">
        {RESPUESTAS.map((r) => (
          <Eleccion key={r.estado} {...r} elegida={elegido === r.estado} onClick={() => setElegido(r.estado)} />
        ))}
        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
