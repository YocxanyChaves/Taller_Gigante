import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import { enlaceWhatsApp, telefonoWhatsApp } from "../../lib/whatsapp";
import { formatoTelefono } from "../../lib/formato";
import { copiar } from "../../lib/copiar";
import Dialogo from "./Dialogo";
import Boton from "./Boton";

// Mensaje de WhatsApp ya escrito (se puede corregir antes de mandarlo) con
// dos botones: abrir WhatsApp y copiar el mensaje. Con `textoListo`, abajo
// aparece un botón para confirmar que ya se mandó ("Ya lo mandé").

export default function DialogoWhatsApp({
  abierto,
  titulo,
  telefono,
  nombre,
  mensaje: mensajeInicial,
  textoListo,
  guardando = false,
  error,
  alListo,
  alCerrar,
}) {
  return (
    <Dialogo
      abierto={abierto}
      titulo={titulo}
      alCerrar={alCerrar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            {textoListo ? "Cancelar" : "Cerrar"}
          </Boton>
          {textoListo && (
            <Boton onClick={alListo} disabled={guardando}>
              {guardando ? "Guardando…" : textoListo}
            </Boton>
          )}
        </>
      }
    >
      {/* key: al abrir de nuevo, vuelve al mensaje original. */}
      {abierto && <Contenido key={mensajeInicial} telefono={telefono} nombre={nombre} mensajeInicial={mensajeInicial} />}
      {error && <p role="alert" className="mt-3 text-lg font-bold text-rojo">{error}</p>}
    </Dialogo>
  );
}

function Contenido({ telefono, nombre, mensajeInicial }) {
  const [mensaje, setMensaje] = useState(mensajeInicial);
  const [copiado, setCopiado] = useState(false);
  const tieneTelefono = Boolean(telefonoWhatsApp(telefono));

  const alCopiar = async () => {
    if (await copiar(mensaje)) {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-tinta">
      <p className="text-gris">
        {tieneTelefono
          ? `Para ${nombre ?? "el cliente"} · ${formatoTelefono(telefono)}. Puede corregir el mensaje antes de mandarlo.`
          : "Este cliente no tiene teléfono anotado: WhatsApp le va a preguntar a quién mandarlo."}
      </p>
      <label className="sr-only" htmlFor="mensaje-whatsapp">
        Mensaje
      </label>
      <textarea
        id="mensaje-whatsapp"
        value={mensaje}
        onChange={(e) => setMensaje(e.target.value)}
        rows={7}
        className="w-full rounded-tarjeta border-2 border-linea-fuerte bg-[#e7f7ec] px-4 py-3 text-lg text-tinta focus:border-tinta focus:outline-none"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Boton variante="whatsapp" icono={MessageCircle} href={enlaceWhatsApp(telefono, mensaje)}>
          Abrir WhatsApp
        </Boton>
        <Boton variante="secundario" icono={copiado ? Check : Copy} onClick={alCopiar}>
          {copiado ? "¡Copiado!" : "Copiar mensaje"}
        </Boton>
      </div>
    </div>
  );
}
