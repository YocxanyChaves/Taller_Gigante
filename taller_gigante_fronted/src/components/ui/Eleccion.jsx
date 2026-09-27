import { Check } from "lucide-react";

// Opción grande para escoger una entre varias ("Ya está aquí", "Hoy", "Sí, es
// Carlos Rojas"). Un botón de verdad con aria-pressed; la elegida se marca con
// borde negro y una palomita.

export default function Eleccion({ elegida, onClick, titulo, ayuda, icono: Icono }) {
  return (
    <button
      type="button"
      aria-pressed={elegida}
      onClick={onClick}
      className={
        "flex min-h-18 w-full items-center gap-4 rounded-tarjeta border-2 bg-tarjeta px-5 py-3 text-left " +
        "transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-elevada active:scale-[0.99] " +
        (elegida ? "border-tinta shadow-elevada" : "border-linea-fuerte")
      }
    >
      {Icono && (
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-suave">
          <Icono aria-hidden="true" size={22} />
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xl font-bold">{titulo}</span>
        {ayuda && <span className="text-base text-gris">{ayuda}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors ${elegida ? "border-tinta bg-tinta text-white" : "border-linea-fuerte"}`}
      >
        {elegida && <Check size={18} strokeWidth={3} className="aparecer" />}
      </span>
    </button>
  );
}
