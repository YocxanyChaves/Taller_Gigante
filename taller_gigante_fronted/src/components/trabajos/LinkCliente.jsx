import { useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, RefreshCw } from "lucide-react";
import { regenerarLink } from "../../services/trabajos";
import { linkCliente } from "../../lib/taller";
import { mensajeLink, mensajeListo } from "../../lib/whatsapp";
import { mensajeError } from "../../lib/errores";
import { copiar } from "../../lib/copiar";
import Boton from "../ui/Boton";
import Confirmar from "../ui/Confirmar";
import DialogoWhatsApp from "../ui/DialogoWhatsApp";

// El link que el cliente abre sin cuenta para ver cómo va su carro (y
// aprobar el precio). Se puede copiar, abrir, mandar por WhatsApp o cambiar
// por uno nuevo si se mandó al número equivocado.

export default function LinkCliente({ trabajo, alCambio }) {
  const [copiado, setCopiado] = useState(false);
  const [mandando, setMandando] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const link = linkCliente(trabajo.token_publico);
  const cliente = trabajo.vehiculo?.cliente;
  const total = trabajo.items.reduce((suma, i) => suma + Number(i.subtotal), 0);
  const datos = { cliente: cliente?.nombre, vehiculo: trabajo.vehiculo ?? {}, total, link };

  const alCopiar = async () => {
    if (await copiar(link)) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const hacerNuevo = async () => {
    setGuardando(true);
    setError("");
    try {
      await regenerarLink(trabajo.id);
      setPreguntando(false);
      await alCambio();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
      <h2 className="border-b border-linea px-6 py-4 text-xl font-bold">Link del cliente</h2>
      <div className="flex flex-col gap-3 p-6">
        <p className="text-base text-gris">
          El cliente lo abre en su celular, sin cuenta, para ver cómo va su carro
          {trabajo.estado === "esperando_aprobacion" ? " y responder si hacemos el trabajo" : ""}.
        </p>
        <p className="rounded-control bg-suave px-3 py-2 text-base break-all text-gris">{link}</p>
        <Boton variante="whatsapp" icono={MessageCircle} onClick={() => setMandando(true)}>
          Mandarlo por WhatsApp
        </Boton>
        <div className="grid grid-cols-2 gap-3">
          <Boton variante="secundario" icono={copiado ? Check : Copy} onClick={alCopiar} className="px-3">
            {copiado ? "¡Copiado!" : "Copiar"}
          </Boton>
          <Boton variante="secundario" icono={ExternalLink} href={link} className="px-3">
            Ver
          </Boton>
        </div>
        <Boton variante="gris" icono={RefreshCw} className="justify-start" onClick={() => setPreguntando(true)}>
          Hacer un link nuevo
        </Boton>
      </div>

      <DialogoWhatsApp
        abierto={mandando}
        titulo="Mandar el link al cliente"
        telefono={cliente?.telefono}
        nombre={cliente?.nombre}
        mensaje={trabajo.estado === "listo" ? mensajeListo(datos) : mensajeLink(datos)}
        alCerrar={() => setMandando(false)}
      />

      <Confirmar
        abierto={preguntando}
        titulo="¿Hacer un link nuevo?"
        textoConfirmar="Sí, hacer uno nuevo"
        cargando={guardando}
        alConfirmar={hacerNuevo}
        alCancelar={() => {
          setPreguntando(false);
          setError("");
        }}
      >
        El link que ya se mandó va a dejar de funcionar. Úselo si lo mandó a un número equivocado.
        {error && <p role="alert" className="mt-3 font-bold text-rojo">{error}</p>}
      </Confirmar>
    </section>
  );
}
