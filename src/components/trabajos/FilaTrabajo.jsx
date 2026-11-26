import { Link } from "react-router-dom";
import { ArrowRight, Gauge, User } from "lucide-react";
import { nombreCarro, diasDesde, textoDias, fechaLarga, formatoKmYMillas } from "../../lib/formato";
import { ESTADOS } from "../../lib/estados";
import Placa from "../ui/Placa";
import Insignia from "../ui/Insignia";

// La tarjeta de un carro en "Carros en el taller", a todo lo ancho y con aire
// (una debajo de la otra, nada apretado). A la izquierda: placa, carro, qué
// dice el cliente que tiene, kilometraje y millas, y el dueño. A la derecha:
// el estado con su semáforo, cuánto lleva así y «Ver el carro». Toda la
// tarjeta lleva a la ficha; al pasar el mouse se levanta y el borde toma el
// color de su etapa.

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
  const millas = trabajo.km_entrada != null ? trabajo.millas_entrada : null;
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
        "tarjeta-carro group animar-entrada relative flex flex-col gap-6 overflow-hidden rounded-tarjeta border-2 border-linea bg-tarjeta p-6 pl-8 shadow-tarjeta sm:p-8 sm:pl-10 md:flex-row md:items-center md:justify-between md:gap-10 " +
        "before:absolute before:inset-y-0 before:left-0 before:w-2 before:content-[''] " +
        franja
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <span className="self-start">
          <Placa>{vehiculo?.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
        </span>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold break-words">{nombreCarro(vehiculo)}</h2>
          <p className="mt-1 text-lg text-gris">{trabajo.problema_reportado}</p>
        </div>
        <div className="flex flex-col gap-2 text-lg sm:flex-row sm:flex-wrap sm:gap-x-8">
          <p className="flex items-center gap-2">
            <Gauge aria-hidden="true" size={20} className="shrink-0 text-gris" />
            <span className="numeros">
              {lectura != null ? (
                formatoKmYMillas(lectura, unidad, millas)
              ) : (
                <span className="text-gris">Sin kilometraje</span>
              )}
            </span>
          </p>
          <p className="flex min-w-0 items-center gap-2">
            <User aria-hidden="true" size={20} className="shrink-0 text-gris" />
            <span className="truncate">{vehiculo?.cliente?.nombre ?? "Sin dueño"}</span>
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-4 border-t border-linea pt-5 md:w-64 md:border-t-0 md:border-l md:pt-0 md:pl-10">
        <div className="flex flex-col gap-1">
          <Insignia estado={trabajo.estado} />
          <span className={`text-lg ${demorado ? "font-bold text-rojo" : "text-gris"}`}>
            {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
          </span>
        </div>
        <span className="flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-linea-fuerte px-4 text-lg font-bold transition-colors duration-200 group-hover:border-tinta group-hover:bg-tinta group-hover:text-white">
          Ver el carro
          <ArrowRight
            aria-hidden="true"
            size={22}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </span>
      </div>
    </Link>
  );
}
