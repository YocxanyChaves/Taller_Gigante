import { useState } from "react";
import { soloDigitos } from "../../lib/formato";
import { actualizarCliente } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";
import Dialogo from "../ui/Dialogo";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";

// "Cambiar datos" del cliente. Nombre y teléfono son obligatorios (el
// teléfono es a donde se mandan los WhatsApp); correo y dirección, no.
// Se monta de nuevo cada vez que se abre, así arranca con los datos actuales.

export default function DialogoCliente({ cliente, alCerrar, alGuardado }) {
  const [datos, setDatos] = useState({
    nombre: cliente.nombre ?? "",
    telefono: cliente.telefono ?? "",
    correo: cliente.correo ?? "",
    direccion: cliente.direccion ?? "",
  });
  const [intento, setIntento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const digitos = soloDigitos(datos.telefono);
  const errores = {
    nombre: datos.nombre.trim().length < 2 ? "Escriba el nombre del cliente." : undefined,
    telefono:
      digitos.length !== 8 ? "El teléfono lleva 8 números, por ejemplo 8888 1111." : undefined,
  };
  const valido = !errores.nombre && !errores.telefono;

  const guardar = async () => {
    setIntento(true);
    if (!valido) return;
    setGuardando(true);
    setError("");
    try {
      await actualizarCliente(cliente.id, { ...datos, telefono: digitos });
      await alGuardado();
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      abierto
      titulo="Cambiar datos del cliente"
      alCerrar={alCerrar}
      alEnviar={guardar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-5 text-tinta">
        <Campo
          etiqueta="Nombre"
          autoFocus
          autoComplete="off"
          value={datos.nombre}
          onChange={cambiar("nombre")}
          error={intento ? errores.nombre : undefined}
        />
        <Campo
          etiqueta="Teléfono"
          inputMode="numeric"
          autoComplete="off"
          ayuda="A este número se mandan los mensajes de WhatsApp."
          value={datos.telefono}
          onChange={cambiar("telefono")}
          error={intento ? errores.telefono : undefined}
        />
        <Campo etiqueta="Correo" opcional type="email" autoComplete="off" value={datos.correo} onChange={cambiar("correo")} />
        <Campo etiqueta="Dirección" opcional multilinea value={datos.direccion} onChange={cambiar("direccion")} />
        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
