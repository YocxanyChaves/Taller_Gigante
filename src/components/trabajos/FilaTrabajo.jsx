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

// El color de la etapa: la franja de la izquierda, el borde y el fondo de la
// zona del semáforo; al pasar el mouse se pinta toda la tarjeta.
const COLOR = {
  verde: {
    tarjeta: "before:bg-verde border-verde/40 hover:border-verde hover:bg-verde/8",
    zona: "bg-verde/10 border-verde/30 group-hover:bg-verde/20",
  },
  amarillo: {
    tarjeta: "before:bg-amarillo border-amarillo/50 hover:border-amarillo hover:bg-amarillo/10",
    zona: "bg-amarillo/12 border-amarillo/40 group-hover:bg-amarillo/25",
  },
  rojo: {
    tarjeta: "before:bg-semaforo-rojo border-semaforo-rojo/30 hover:border-semaforo-rojo hover:bg-semaforo-rojo/5",
    zona: "bg-semaforo-rojo/8 border-semaforo-rojo/25 group-hover:bg-semaforo-rojo/15",
  },
  apagado: {
    tarjeta: "before:bg-linea-fuerte border-linea hover:border-tinta hover:bg-suave/60",
    zona: "bg-suave border-linea group-hover:bg-suave",
  },
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
        "tarjeta-carro group animar-entrada relative flex flex-col overflow-hidden rounded-tarjeta border-2 bg-tarjeta shadow-tarjeta md:flex-row " +
        "before:absolute before:inset-y-0 before:left-0 before:w-2 before:content-[''] " +
        color.tarjeta
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4 p-6 pl-8 sm:p-8 sm:pl-10">
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
        className={`flex shrink-0 flex-col justify-center gap-4 border-t-2 p-6 pl-8 transition-colors duration-200 sm:px-8 md:w-72 md:border-t-0 md:border-l-2 md:pl-8 ${color.zona}`}
      >
        <div className="flex flex-col gap-1">
          <Insignia estado={trabajo.estado} />
          <span className={`text-lg ${demorado ? "font-bold text-rojo" : "text-gris"}`}>
            {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
          </span>
        </div>
        <span className="flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-linea-fuerte px-4 text-lg font-bold transition-colors duration-200 bg-tarjeta group-hover:border-tinta group-hover:bg-tinta group-hover:text-white">
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
