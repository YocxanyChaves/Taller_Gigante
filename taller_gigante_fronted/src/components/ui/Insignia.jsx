import { ESTADOS } from "../../lib/estados";

// Estado de un trabajo: un cuadrito de color y el texto. El color solo
// acompaña; el texto siempre está.

const TONOS = {
  azul: { caja: "border-azul-vivo/40 bg-azul/15 text-azul-vivo", punto: "bg-azul-vivo" },
  rojo: { caja: "border-rojo-vivo/50 bg-rojo/20 text-rojo-vivo", punto: "bg-rojo-vivo" },
  cromo: { caja: "border-cromo/50 bg-cromo/10 text-cromo", punto: "bg-cromo" },
  acero: { caja: "border-acero/40 bg-transparent text-acero", punto: "bg-acero" },
};

export default function Insignia({ estado, grande = false }) {
  const { texto, tono } = ESTADOS[estado] ?? { texto: estado, tono: "acero" };
  const { caja, punto } = TONOS[tono];

  return (
    <span
      className={`rotulo inline-flex items-center gap-2 border ${grande ? "px-3 py-1 text-xl" : "px-2 py-0.5 text-base"} ${caja}`}
    >
      <span aria-hidden="true" className={`${grande ? "size-2.5" : "size-2"} ${punto}`} />
      {texto}
    </span>
  );
}
