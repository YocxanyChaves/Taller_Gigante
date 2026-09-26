import { ESTADOS } from "../../lib/estados";

// Estado de un trabajo. Siempre con texto: el color solo acompaña.

const TONOS = {
  azul: "border-azul-vivo text-azul-vivo",
  rojo: "border-rojo-vivo bg-rojo text-white",
  cromo: "border-cromo bg-cromo text-fondo",
  acero: "border-acero text-acero",
};

export default function Insignia({ estado, grande = false }) {
  const { texto, tono } = ESTADOS[estado] ?? { texto: estado, tono: "acero" };

  return (
    <span
      className={`rotulo inline-block border-2 ${grande ? "px-3 py-1 text-xl" : "px-2 py-0.5 text-base"} ${TONOS[tono]}`}
    >
      {texto}
    </span>
  );
}
