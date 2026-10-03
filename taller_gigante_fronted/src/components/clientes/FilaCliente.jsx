import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatoColones, formatoTelefono } from "../../lib/formato";
import Placa from "../ui/Placa";

// Una fila de "Buscar un cliente": nombre, teléfono, sus placas y, si aplica,
// cuántos carros tiene en el taller y cuánto debe. Toda la fila lleva a la ficha.

export default function FilaCliente({ cliente, retraso = 0 }) {
  const debe = Number(cliente.debe);

  return (
    <Link
      to={`/clientes/${cliente.id}`}
      style={{ "--retraso": `${retraso}ms` }}
      className="group animar-entrada flex items-center gap-4 border-b border-linea px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-fondo md:px-6"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <span className="flex min-w-0 flex-col md:w-72 md:shrink-0">
          <span className="truncate text-lg font-bold">{cliente.nombre}</span>
          <span className="numeros text-base text-gris">{formatoTelefono(cliente.telefono)}</span>
        </span>

        <span className="flex flex-wrap items-center gap-2 md:flex-1">
          {cliente.placas.length ? (
            cliente.placas.map((placa) => <Placa key={placa}>{placa}</Placa>)
          ) : (
            <span className="text-base text-gris">Sin carros anotados</span>
          )}
        </span>

        {(debe > 0 || cliente.en_taller > 0) && (
          <span className="flex flex-col gap-0.5 md:items-end md:text-right">
            {debe > 0 && <span className="numeros text-lg font-bold text-rojo">Debe {formatoColones(debe)}</span>}
            {cliente.en_taller > 0 && (
              <span className="text-base text-gris">
                {cliente.en_taller === 1 ? "1 carro en el taller" : `${cliente.en_taller} carros en el taller`}
              </span>
            )}
          </span>
        )}
      </span>

      <ChevronRight
        aria-hidden="true"
        size={24}
        className="shrink-0 text-gris transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}
