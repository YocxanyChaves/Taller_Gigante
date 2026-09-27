import { ESTADOS } from "../../lib/estados";
import Semaforo from "./Semaforo";

// Estado de un trabajo: el semaforito y el texto del color de su luz.

const COLOR_TEXTO = {
  rojo: "text-rojo-texto",
  amarillo: "text-amarillo-texto",
  verde: "text-verde-texto",
};

export default function Insignia({ estado, grande = false }) {
  const { texto, luz } = ESTADOS[estado] ?? { texto: estado, luz: null };

  return (
    <span className={`inline-flex items-center gap-2.5 font-bold ${grande ? "text-xl" : "text-lg"} ${COLOR_TEXTO[luz] ?? "text-gris"}`}>
      <Semaforo luz={luz} grande={grande} />
      {texto}
    </span>
  );
}
