import { Link } from "react-router-dom";
import { ArrowRight, Gauge, User } from "lucide-react";
import { nombreCarro, diasDesde, textoDias, fechaLarga, formatoKmYMillas } from "../../lib/formato";
import { ESTADOS } from "../../lib/estados";
import Placa from "../ui/Placa";
import Insignia from "../ui/Insignia";

// La tarjeta de un carro en "Carros en el taller": placa, carro, qué dice el
// cliente que tiene, kilometraje y millas, dueño, el estado con su semáforo y
// cuánto lleva así. Toda la tarjeta lleva a la ficha; al pasar el mouse se
// levanta y se le marca el borde con el color de su etapa.

// Más de 3 días esperando respuesta del cliente: se marca en rojo.
const DIAS_ALERTA = 3;

const FRANJA = {
  verde: "before:bg-verde hover:border-verde",
  amarillo: "before:bg-amarillo hover:border-amarillo",
  rojo: "before:bg-semaforo-rojo hover:border-semaforo-rojo",
};

export default function FilaTrabajo({ trabajo, retraso = 0 }) {
  const { vehiculo } = trabajo;
  const dias = diasDesde(trabajo.enEtapaDesde);
  const demorado = trabajo.estado === "esperando_aprobacion" && dias > DIAS_ALERTA;
  const lectura = trabajo.km_entrada ?? vehiculo?.kilometraje;
  const unidad = trabajo.km_entrada != null ? trabajo.unidad_distancia : vehiculo?.unidad_distancia;
  const franja = FRANJA[ESTADOS[trabajo.estado]?.luz] ?? "before:bg-linea-fuerte hover:border-tinta";

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
        "tarjeta-carro group animar-entrada relative flex flex-col overflow-hidden rounded-tarjeta border-2 border-linea bg-tarjeta shadow-tarjeta " +
        "before:absolute before:inset-x-0 before:top-0 before:h-1.5 before:content-[''] " +
        franja
      }
    >
      <div className="flex flex-1 flex-col gap-3 p-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <Placa>{vehiculo?.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
          <Insignia estado={trabajo.estado} />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold break-words">{nombreCarro(vehiculo)}</h2>
          <p className="mt-1 line-clamp-2 text-lg text-gris">{trabajo.problema_reportado}</p>
        </div>

        <div className="mt-auto flex flex-col gap-1.5 text-base">
          <p className="flex items-center gap-2">
            <Gauge aria-hidden="true" size={18} className="shrink-0 text-gris" />
            <span className="numeros">
              {lectura != null ? formatoKmYMillas(lectura, unidad) : <span className="text-gris">Sin kilometraje</span>}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <User aria-hidden="true" size={18} className="shrink-0 text-gris" />
            <span className="truncate">{vehiculo?.cliente?.nombre ?? "Sin dueño"}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-linea bg-fondo px-5 py-3 transition-colors duration-200 group-hover:bg-suave">
        <span className={`text-base ${demorado ? "font-bold text-rojo" : "text-gris"}`}>
          {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
        </span>
        <span className="flex items-center gap-1 text-base font-bold whitespace-nowrap">
          Ver
          <ArrowRight
            aria-hidden="true"
            size={20}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
