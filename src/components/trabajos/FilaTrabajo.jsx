import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { nombreCarro, diasDesde, textoDias, fechaLarga } from "../../lib/formato";
import Placa from "../ui/Placa";
import Insignia from "../ui/Insignia";

// Una fila de "Carros en el taller": placa, carro y cliente, qué le pasa,
// el estado con su semáforo y cuánto lleva así. Toda la fila lleva a la ficha.

// Más de 3 días esperando respuesta del cliente: se marca en rojo.
const DIAS_ALERTA = 3;

export default function FilaTrabajo({ trabajo, retraso = 0 }) {
  const { vehiculo } = trabajo;
  const dias = diasDesde(trabajo.enEtapaDesde);
  const demorado = trabajo.estado === "esperando_aprobacion" && dias > DIAS_ALERTA;

  const tiempo =
    trabajo.estado === "cita"
      ? trabajo.fecha_cita
        ? `Viene el ${fechaLarga(trabajo.fecha_cita)}`
        : "Sin día de cita"
      : dias === 0
        ? "Desde hoy"
        : `Hace ${textoDias(dias)}`;

  return (
    <Link
      to={`/trabajos/${trabajo.id}`}
      style={{ "--retraso": `${retraso}ms` }}
      className={
        "group animar-entrada grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-linea px-5 py-4 last:border-b-0 " +
        "transition-colors duration-200 hover:bg-fondo md:grid-cols-[8.5rem_minmax(0,1fr)_16rem_auto] md:gap-6 md:px-6"
      }
    >
      <span className="justify-self-start">
        <Placa>{vehiculo?.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
      </span>

      <ChevronRight
        aria-hidden="true"
        size={24}
        className="col-start-2 row-start-1 text-gris transition-transform duration-200 group-hover:translate-x-1 md:col-start-4"
      />

      <span className="col-span-2 flex min-w-0 flex-col md:col-span-1 md:col-start-2 md:row-start-1">
        <span className="truncate text-lg font-bold">
          {nombreCarro(vehiculo)} · {vehiculo?.cliente?.nombre ?? "Sin dueño"}
        </span>
        <span className="truncate text-base text-gris">{trabajo.problema_reportado}</span>
      </span>

      <span className="col-span-2 flex flex-col gap-0.5 md:col-span-1 md:col-start-3 md:row-start-1">
        <Insignia estado={trabajo.estado} />
        <span className={`text-base ${demorado ? "font-bold text-rojo" : "text-gris"}`}>
          {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
        </span>
      </span>
    </Link>
  );
}
