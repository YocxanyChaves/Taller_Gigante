import { useState } from "react";
import { CarFront, ClipboardPen, MessageCircleReply, PackageCheck, Sparkles, Send } from "lucide-react";
import { avanzarEstado, registrarLlegada } from "../../services/trabajos";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Confeti from "../ui/Confeti";
import DialogoLlegada from "./DialogoLlegada";
import DialogoRespuesta from "./DialogoRespuesta";

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
            boton: "Ya le avisé el precio al cliente",
            frase: "Toque aquí cuando le haya dicho el precio. El carro queda esperando su respuesta.",
            icono: Send,
            accion: "esperando_aprobacion",
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
        frase: "Anote si aprobó el trabajo o no (si le respondió por teléfono o en persona).",
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
    default:
      return null;
  }
}

// Lo que se ve cuando no hay botón (todavía no existe ese paso o ya terminó).
const SIN_PASO = {
  listo: "Cuando el cliente venga, aquí va a estar «Entregar y cobrar» (se agrega en la fase 5).",
  no_aprobado: "Cuando el cliente venga por el carro, aquí va a estar «Se llevó el carro» (fase 5).",
  entregado: "Este trabajo ya terminó: el carro se entregó.",
  cancelado: "Este trabajo se canceló.",
};

export default function SiguientePaso({ trabajo, alEditarPrecio, alCambio }) {
  const [dialogo, setDialogo] = useState(null); // "llegada" | "respuesta" | null
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [celebrando, setCelebrando] = useState(false);

  const paso = pasoPara(trabajo);

  const ejecutar = async (hacer, { celebrar = false } = {}) => {
    setGuardando(true);
    setError("");
    try {
      await hacer();
      setDialogo(null);
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
    if (paso.accion === "llegada" || paso.accion === "respuesta") {
      setError("");
      return setDialogo(paso.accion);
    }
    ejecutar(() => avanzarEstado(trabajo.id, paso.accion), { celebrar: paso.accion === "listo" });
  };

  if (!paso) {
    return (
      <section className="rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta">
        <p className="etiqueta">Siguiente paso</p>
        <p className="mt-2 text-lg text-gris">{SIN_PASO[trabajo.estado]}</p>
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
    </section>
  );
}
