import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Una opción grande del menú de Inicio: ícono, qué es y una frase de ayuda.
// `destacada` = la acción más común (círculo rojo). Al pasar el mouse se
// levanta, el ícono se menea y la flecha avanza.

export default function OpcionMenu({ to, icono: Icono, titulo, ayuda, destacada = false, retraso = 0 }) {
  return (
    <Link
      to={to}
      style={{ "--retraso": `${retraso}ms` }}
      className="group animar-entrada flex min-h-21 items-center gap-4 rounded-tarjeta border border-linea bg-tarjeta px-4 py-4 sm:gap-5 sm:px-6 shadow-tarjeta transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-linea-fuerte hover:shadow-elevada active:scale-[0.99]"
    >
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-full ${destacada ? "bg-rojo text-white" : "bg-suave text-tinta"}`}
      >
        <Icono aria-hidden="true" size={24} strokeWidth={destacada ? 2.6 : 2} className="menear" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xl font-bold">{titulo}</span>
        <span className="text-base text-gris">{ayuda}</span>
      </span>
      <ChevronRight
        aria-hidden="true"
        size={24}
        className="shrink-0 text-gris transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
