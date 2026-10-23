import { CalendarClock } from "lucide-react";
import { diasParaPagar, fechaDeDia, fechaLarga, isoAFechaInput } from "../../lib/formato";
import Campo from "../ui/Campo";

// El próximo pago de alguien que paga en cuotas: la fecha y si ya le toca.
// Rojo si está atrasado, amarillo si es hoy o mañana, gris si falta.

function textoFaltan(faltan) {
  if (faltan < 0) return faltan === -1 ? "atrasado 1 día" : `atrasado ${-faltan} días`;
  if (faltan === 0) return "le toca hoy";
  if (faltan === 1) return "mañana";
  return `en ${faltan} días`;
}

export default function ProximoPago({ dia, className = "" }) {
  const faltan = diasParaPagar(dia);
  if (faltan === null) return null;
  const color =
    faltan < 0
      ? "bg-rojo/10 text-rojo"
      : faltan <= 1
        ? "bg-amarillo/15 text-amarillo-texto"
        : "bg-suave text-gris";

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 rounded-full px-3 py-1 text-base font-bold ${color} ${className}`}>
      <CalendarClock aria-hidden="true" size={18} />
      <span className="first-letter:uppercase">
        Próximo pago: {fechaLarga(fechaDeDia(dia).toISOString())} ({textoFaltan(faltan)})
      </span>
    </span>
  );
}

// El campo para escoger la fecha del próximo pago (desde hoy en adelante).
export function CampoProximoPago({ valor, alCambiar, ayuda }) {
  return (
    <Campo
      etiqueta="¿Cuándo es el próximo pago?"
      opcional
      type="date"
      min={isoAFechaInput(new Date().toISOString())}
      ayuda={ayuda ?? "Así sale en «Quién debe» y en Inicio cuando le toque."}
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
    />
  );
}
