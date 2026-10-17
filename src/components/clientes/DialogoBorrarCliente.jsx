import { useState } from "react";
import { Trash2, UserX } from "lucide-react";
import { eliminarCliente } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Dialogo from "../ui/Dialogo";
import Eleccion from "../ui/Eleccion";

// "Borrar este cliente": escoger si se borra todo (carros, trabajos y fotos;
// por ejemplo, si el cliente pidió que borraran sus datos) o solo el cliente
// (los carros y trabajos se quedan sin dueño y siguen contando en la plata).
// Nada se borra hasta tocar el botón rojo, que nombra lo que va a pasar.

export default function DialogoBorrarCliente({ cliente, alCerrar, alBorrado }) {
  const [modo, setModo] = useState(null); // "todo" | "conservar_historial"
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState("");

  const carros = cliente.vehiculos.length;
  const trabajos = cliente.vehiculos.reduce((suma, v) => suma + v.ordenes.length, 0);
  const deCarros =
    carros === 0
      ? "No tiene carros anotados."
      : `${carros === 1 ? "1 carro" : `${carros} carros`} y ${trabajos === 1 ? "1 trabajo" : `${trabajos} trabajos`}.`;

  const borrar = async () => {
    setBorrando(true);
    setError("");
    try {
      await eliminarCliente(cliente, modo);
      alBorrado();
    } catch (e) {
      setError(mensajeError(e));
      setBorrando(false);
    }
  };

  return (
    <Dialogo
      abierto
      titulo={`¿Borrar a ${cliente.nombre}?`}
      rol="alertdialog"
      alCerrar={borrando ? () => {} : alCerrar}
      pie={
        <>
          <Boton variante="secundario" onClick={alCerrar} disabled={borrando}>
            No, volver
          </Boton>
          <Boton variante="peligro" icono={Trash2} onClick={borrar} disabled={!modo || borrando}>
            {borrando ? "Borrando…" : modo === "todo" ? "Sí, borrar todo" : "Sí, borrar el cliente"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p>
          {deCarros} Esto no se puede deshacer. ¿Qué quiere borrar?
        </p>
        <Eleccion
          elegida={modo === "todo"}
          onClick={() => setModo("todo")}
          icono={Trash2}
          titulo="Borrar todo"
          ayuda="El cliente, sus carros, sus trabajos y sus fotos. Por ejemplo, si pidió que borráramos sus datos."
        />
        <Eleccion
          elegida={modo === "conservar_historial"}
          onClick={() => setModo("conservar_historial")}
          icono={UserX}
          titulo="Borrar solo el cliente"
          ayuda="Los carros y los trabajos se quedan, sin dueño. La plata de esos trabajos sigue contando."
        />
        {error && <p role="alert" className="font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
