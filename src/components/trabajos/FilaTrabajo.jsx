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

// El color de la etapa: borde grueso y sólido alrededor (más grueso a la
// izquierda), la zona del semáforo como un recuadro redondeado por dentro y el
// botón «Ver el carro», que al pasar el mouse se pinta del mismo color sólido
// del borde. Al pasar el mouse se pinta también toda la tarjeta.
const COLOR = {
  verde: {
    tarjeta: "border-verde hover:bg-verde/8",
    zona: "bg-verde/12 group-hover:bg-verde/20",
    boton: "border-verde text-verde-texto group-hover:bg-verde group-hover:text-white",
  },
  amarillo: {
    tarjeta: "border-amarillo hover:bg-amarillo/10",
    zona: "bg-amarillo/15 group-hover:bg-amarillo/25",
    boton: "border-amarillo text-amarillo-texto group-hover:bg-amarillo group-hover:text-tinta",
  },
  rojo: {
    tarjeta: "border-semaforo-rojo hover:bg-semaforo-rojo/5",
    zona: "bg-semaforo-rojo/8 group-hover:bg-semaforo-rojo/15",
    boton: "border-semaforo-rojo text-rojo-texto group-hover:bg-semaforo-rojo group-hover:text-white",
  },
  apagado: {
    tarjeta: "border-linea-fuerte hover:bg-suave/60",
    zona: "bg-suave group-hover:bg-linea/60",
    boton: "border-linea-fuerte text-tinta group-hover:bg-tinta group-hover:text-white",
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
        "tarjeta-carro group animar-entrada flex flex-col gap-2 rounded-[18px] border-[3px] border-l-[10px] bg-tarjeta p-2 shadow-tarjeta md:flex-row " +
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
        className={`flex shrink-0 flex-col justify-center gap-4 rounded-[12px] p-5 transition-colors duration-200 sm:p-6 md:w-72 ${color.zona}`}
      >
        <div className="flex flex-col gap-1">
          <Insignia estado={trabajo.estado} />
          <span className={`text-lg ${demorado ? "font-bold text-rojo" : "text-gris"}`}>
            {demorado ? `¡Lleva ${textoDias(dias)} sin responder!` : tiempo}
          </span>
        </div>
        <span
          className={`flex min-h-12 items-center justify-center gap-2 rounded-control border-[3px] bg-tarjeta px-4 text-lg font-bold transition-colors duration-200 ${color.boton}`}
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
