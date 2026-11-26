import { Link } from "react-router-dom";
import { ArrowRight, Gauge, User } from "lucide-react";
import { nombreCarro, diasDesde, textoDias, fechaLarga, formatoKmYMillas } from "../../lib/formato";
import { ESTADOS } from "../../lib/estados";
import Placa from "../ui/Placa";
import Semaforo from "../ui/Semaforo";

// La tarjeta de un carro en "Carros en el taller", a todo lo ancho y con aire
// (una debajo de la otra, nada apretado). A la izquierda: placa, carro, qué
// dice el cliente que tiene, kilometraje y millas, y el dueño. A la derecha:
// el estado con su semáforo, cuánto lleva así y «Ver el carro». Toda la
// tarjeta lleva a la ficha; al pasar el mouse se levanta y el borde toma el
// color de su etapa.

// Más de 3 días esperando respuesta del cliente: se marca en rojo.
const DIAS_ALERTA = 3;

// El color de la etapa: borde grueso y sólido alrededor (más grueso a la
// izquierda) y la zona del semáforo como un recuadro de ese mismo color
// sólido, siempre. La tarjeta no cambia de color al pasar el mouse: solo se
// levanta. El botón «Ver el carro» es blanco y se pone negro al pasar el
// mouse por el recuadro.
const COLOR = {
  verde: { tarjeta: "border-verde", zona: "bg-verde text-white", luz: "verde" },
  amarillo: { tarjeta: "border-amarillo", zona: "bg-amarillo text-tinta", luz: "amarillo" },
  rojo: { tarjeta: "border-semaforo-rojo", zona: "bg-semaforo-rojo text-white", luz: "rojo" },
  apagado: { tarjeta: "border-linea-fuerte", zona: "bg-linea-fuerte text-tinta", luz: null },
};

export default function FilaTrabajo({ trabajo, retraso = 0 }) {
  const { vehiculo } = trabajo;
  const dias = diasDesde(trabajo.enEtapaDesde);
  const demorado = trabajo.estado === "esperando_aprobacion" && dias > DIAS_ALERTA;
  const lectura = trabajo.km_entrada ?? vehiculo?.kilometraje;
  const unidad = trabajo.km_entrada != null ? trabajo.unidad_distancia : vehiculo?.unidad_distancia;
  const millas = trabajo.km_entrada != null ? trabajo.millas_entrada : null;
  const color = COLOR[ESTADOS[trabajo.estado]?.luz] ?? COLOR.apagado;

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
        "tarjeta-carro tarjeta-fuerte group animar-entrada flex flex-col gap-2 rounded-[18px] border-[3px] border-l-[10px] bg-tarjeta p-2 shadow-tarjeta md:flex-row " +
        color.tarjeta
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-6">
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

      <div
        className={`group/zona flex shrink-0 flex-col justify-center gap-4 rounded-[12px] p-5 sm:p-6 md:w-72 ${color.zona}`}
      >
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-2.5 text-lg font-bold">
            <Semaforo luz={color.luz} />
            {ESTADOS[trabajo.estado]?.texto ?? trabajo.estado}
          </span>
          <span className={`text-lg ${demorado ? "font-bold underline decoration-2 underline-offset-4" : "opacity-90"}`}>
            {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
          </span>
        </div>
        <span
          className="flex min-h-12 items-center justify-center gap-2 rounded-control bg-tarjeta px-4 text-lg font-bold text-tinta shadow-tarjeta transition-colors duration-200 group-hover/zona:bg-tinta group-hover/zona:text-white"
        >
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
