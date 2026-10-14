import { useState } from "react";
import { CarFront, ClipboardPen, HandCoins, KeyRound, MessageCircle, MessageCircleReply, PackageCheck, Sparkles } from "lucide-react";
import { avanzarEstado, registrarLlegada } from "../../services/trabajos";
import { entregarTrabajo } from "../../services/cobros";
import { mensajeError } from "../../lib/errores";
import { linkCliente } from "../../lib/taller";
import { mensajeCotizacion, mensajeListo } from "../../lib/whatsapp";
import Boton from "../ui/Boton";
import Confeti from "../ui/Confeti";
import DialogoLlegada from "./DialogoLlegada";
import DialogoRespuesta from "./DialogoRespuesta";
import DialogoWhatsApp from "../ui/DialogoWhatsApp";
import DialogoEntregar from "../cobros/DialogoEntregar";

// El botón rojo grande de cada trabajo: dice cuál es el siguiente paso y qué
// pasa al tocarlo. Es la única acción principal de la ficha.

function pasoPara(trabajo) {
  const tienePrecio = trabajo.items.length > 0;
  switch (trabajo.estado) {
    case "cita":
      return {
        boton: "Ya llegó el carro",
        frase: "Anote cómo llegó (si quiere) y el carro pasa a revisión.",
        icono: CarFront,
        accion: "llegada",
      };
    case "en_revision":
      return tienePrecio
        ? {
            boton: "Mandar precio por WhatsApp",
            frase: "Se abre WhatsApp con el precio y un link para que el cliente responda desde su celular.",
            icono: MessageCircle,
            accion: "whatsapp_precio",
          }
        : {
            boton: "Anotar diagnóstico y precio",
            frase: "Escriba qué tiene el carro y cuánto cuesta arreglarlo.",
            icono: ClipboardPen,
            accion: "precio",
          };
    case "esperando_aprobacion":
      return {
        boton: "El cliente respondió",
        frase: "El cliente puede responder desde su link. Si le respondió por teléfono o en persona, anótelo aquí.",
        icono: MessageCircleReply,
        accion: "respuesta",
      };
    case "esperando_repuestos":
      return {
        boton: "Ya llegaron los repuestos",
        frase: "El carro pasa a reparación.",
        icono: PackageCheck,
        accion: "en_reparacion",
      };
    case "en_reparacion":
      return {
        boton: "El carro está listo",
        frase: "El carro queda listo para que el cliente lo recoja.",
        icono: Sparkles,
        accion: "listo",
      };
    case "listo":
      return {
        boton: "Entregar y cobrar",
        frase: "Cuando el cliente venga: cobre todo o la primera cuota y el carro queda entregado.",
        icono: HandCoins,
        accion: "entregar",
      };
    case "no_aprobado":
      return {
        boton: "Se llevó el carro",
        frase: "Cuando el cliente venga por el carro. Si le cobra la revisión, se anota aquí.",
        icono: KeyRound,
        accion: "entregar",
      };
    default:
      return null;
  }
}

// Lo que se ve cuando no hay botón (todavía no existe ese paso o ya terminó).
const SIN_PASO = {
  entregado: "Este trabajo ya terminó: el carro se entregó.",
  cancelado: "Este trabajo se canceló.",
};

export default function SiguientePaso({ trabajo, alEditarPrecio, alCambio }) {
  const [dialogo, setDialogo] = useState(null); // "llegada" | "respuesta" | "whatsapp_precio" | "whatsapp_listo" | "entregar" | null
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [celebrando, setCelebrando] = useState(false);

  const paso = pasoPara(trabajo);

  const ejecutar = async (hacer, { celebrar = false, luego = null } = {}) => {
    setGuardando(true);
    setError("");
    try {
      await hacer();
      setDialogo(luego);
      if (celebrar) {
        setCelebrando(true);
        setTimeout(() => setCelebrando(false), 1400);
      }
      await alCambio();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const tocar = () => {
    if (paso.accion === "precio") return alEditarPrecio();
    if (["llegada", "respuesta", "whatsapp_precio", "entregar"].includes(paso.accion)) {
      setError("");
      return setDialogo(paso.accion);
    }
    // Al quedar listo: confeti y se ofrece avisarle al cliente por WhatsApp.
    const listo = paso.accion === "listo";
    ejecutar(() => avanzarEstado(trabajo.id, paso.accion), { celebrar: listo, luego: listo ? "whatsapp_listo" : null });
  };

  const cliente = trabajo.vehiculo?.cliente;
  const datosMensaje = {
    cliente: cliente?.nombre,
    vehiculo: trabajo.vehiculo ?? {},
    diagnostico: trabajo.diagnostico,
    items: trabajo.items,
    total: trabajo.items.reduce((suma, i) => suma + Number(i.subtotal), 0),
    link: linkCliente(trabajo.token_publico),
  };

  // Las ventanitas van fuera del botón: la de "avisar que está listo" se abre
  // justo cuando el carro ya no tiene siguiente paso.
  const dialogos = (
    <>
      <DialogoLlegada
        abierto={dialogo === "llegada"}
        guardando={guardando}
        error={error}
        alCerrar={() => setDialogo(null)}
        alGuardar={(datos) => ejecutar(() => registrarLlegada(trabajo, datos))}
      />
      <DialogoRespuesta
        abierto={dialogo === "respuesta"}
        guardando={guardando}
        error={error}
        alCerrar={() => setDialogo(null)}
        alGuardar={(estado) => ejecutar(() => avanzarEstado(trabajo.id, estado))}
      />
      <DialogoWhatsApp
        abierto={dialogo === "whatsapp_precio"}
        titulo="Mandar el precio al cliente"
        telefono={cliente?.telefono}
        nombre={cliente?.nombre}
        mensaje={mensajeCotizacion(datosMensaje)}
        textoListo="Ya lo mandé"
        guardando={guardando}
        error={error}
        alListo={() => ejecutar(() => avanzarEstado(trabajo.id, "esperando_aprobacion"))}
        alCerrar={() => setDialogo(null)}
      />
      {dialogo === "entregar" && (
        <DialogoEntregar
          trabajo={trabajo}
          guardando={guardando}
          error={error}
          alCerrar={() => setDialogo(null)}
          alGuardar={(datos) => ejecutar(() => entregarTrabajo(trabajo.id, datos), { celebrar: true })}
        />
      )}
      <DialogoWhatsApp
        abierto={dialogo === "whatsapp_listo"}
        titulo="¡Listo! ¿Le avisamos al cliente?"
        telefono={cliente?.telefono}
        nombre={cliente?.nombre}
        mensaje={mensajeListo(datosMensaje)}
        alCerrar={() => setDialogo(null)}
      />
    </>
  );

  if (!paso) {
    return (
      <section className="relative rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta">
        {celebrando && <Confeti />}
        <p className="etiqueta">Siguiente paso</p>
        <p className="mt-2 text-lg text-gris">{SIN_PASO[trabajo.estado]}</p>
        {dialogos}
      </section>
    );
  }

  return (
    <section className="relative rounded-tarjeta border-2 border-rojo/20 bg-tarjeta p-6 shadow-elevada">
      {celebrando && <Confeti />}
      <p className="etiqueta">Siguiente paso</p>
      <p className="mt-2 text-xl">{paso.frase}</p>
      <Boton icono={paso.icono} onClick={tocar} disabled={guardando} anchoCompleto className="mt-5 min-h-16 text-xl">
        {guardando && !dialogo ? "Guardando…" : paso.boton}
      </Boton>
      {error && !dialogo && (
        <p role="alert" className="aparecer mt-3 text-lg font-bold text-rojo">
          {error}
        </p>
      )}
      {dialogos}
    </section>
  );
}
