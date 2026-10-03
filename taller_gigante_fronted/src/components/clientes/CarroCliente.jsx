import { Link } from "react-router-dom";
import { Car, ChevronRight, Wrench } from "lucide-react";
import { formatoColones, formatoKm, nombreCarro, fechaLarga } from "../../lib/formato";
import Placa from "../ui/Placa";
import Insignia from "../ui/Insignia";
import Boton from "../ui/Boton";

// Un carro del cliente con su historial de trabajos (el más nuevo arriba).
// Si el carro está en el taller, el botón lleva a ese trabajo; si no, a
// "Recibir un carro" con la placa ya puesta.

export default function CarroCliente({ vehiculo, retraso = 0 }) {
  const activo = vehiculo.ordenes.find((o) => !["entregado", "cancelado"].includes(o.estado));
  const placa = vehiculo.placa?.toUpperCase() ?? "";

  return (
    <section
      style={{ "--retraso": `${retraso}ms` }}
      className="animar-entrada rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta"
    >
      <header className="flex flex-col gap-4 border-b border-linea px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-2">
          <Placa grande>{placa || "SIN PLACA"}</Placa>
          <h3 className="text-2xl font-bold">{nombreCarro(vehiculo)}</h3>
          {vehiculo.kilometraje != null && (
            <p className="text-base text-gris">Último kilometraje: {formatoKm(vehiculo.kilometraje)}</p>
          )}
        </div>
        {activo ? (
          <Boton variante="secundario" icono={Wrench} to={`/trabajos/${activo.id}`}>
            Ver el trabajo de ahora
          </Boton>
        ) : (
          <Boton variante="secundario" icono={Car} to={`/trabajos/nuevo?placa=${encodeURIComponent(placa)}`}>
            Recibir este carro
          </Boton>
        )}
      </header>

      {vehiculo.ordenes.length === 0 ? (
        <p className="px-6 py-5 text-lg text-gris">Este carro todavía no tiene trabajos anotados.</p>
      ) : (
        <ol aria-label={`Trabajos del ${nombreCarro(vehiculo)} ${placa}`}>
          {vehiculo.ordenes.map((o) => (
            <li key={o.id} className="border-b border-linea last:border-b-0">
              <FilaHistorial orden={o} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function FilaHistorial({ orden }) {
  const fecha = orden.estado === "cita" && orden.fecha_cita ? orden.fecha_cita : orden.fecha_ingreso;
  const debe = orden.estado === "entregado" && orden.saldo > 0;

  return (
    <Link
      to={`/trabajos/${orden.id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-6 py-4 transition-colors duration-200 hover:bg-fondo md:grid-cols-[13rem_minmax(0,1fr)_14rem_auto]"
    >
      <span className="text-base text-gris first-letter:uppercase md:text-lg">{fechaLarga(fecha)}</span>
      <ChevronRight
        aria-hidden="true"
        size={22}
        className="col-start-2 row-start-1 text-gris transition-transform duration-200 group-hover:translate-x-1 md:col-start-4"
      />
      <span className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
        <span className="block truncate text-lg font-bold">{orden.diagnostico || orden.problema_reportado}</span>
        <Insignia estado={orden.estado} />
      </span>
      <span className="col-span-2 flex flex-col md:col-span-1 md:col-start-3 md:row-start-1 md:items-end">
        {orden.total > 0 && <span className="numeros text-lg">{formatoColones(orden.total)}</span>}
        {debe && <span className="numeros text-base font-bold text-rojo">Debe {formatoColones(orden.saldo)}</span>}
      </span>
    </Link>
  );
}
