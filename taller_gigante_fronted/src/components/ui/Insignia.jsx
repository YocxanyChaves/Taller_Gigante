import { ESTADOS } from "../../lib/estados";

// Estado de un trabajo: una luz del color del estado y el texto. El color
// solo acompaña; el texto siempre está. "Esperando respuesta" late, porque
// hay que hacer algo.

const TONOS = {
  azul: { caja: "border-azul-vivo/35 bg-azul/15 text-azul-vivo", luz: "bg-azul-vivo" },
  rojo: { caja: "border-rojo-vivo/45 bg-rojo/20 text-rojo-vivo", luz: "bg-rojo-vivo latido" },
  cromo: { caja: "border-cromo/40 bg-cromo/10 text-cromo", luz: "bg-cromo" },
  acero: { caja: "border-white/10 bg-white/[0.03] text-acero", luz: "bg-acero" },
};

export default function Insignia({ estado, grande = false }) {
  const { texto, tono } = ESTADOS[estado] ?? { texto: estado, tono: "acero" };
  const { caja, luz } = TONOS[tono];

  return (
    <span
      className={`rotulo inline-flex items-center gap-2 rounded-full border ${grande ? "px-4 py-1.5 text-lg" : "px-3 py-1 text-base"} ${caja}`}
    >
      <span aria-hidden="true" className={`luz ${grande ? "size-2.5" : "size-2"} ${luz}`} />
      {texto}
    </span>
  );
}
