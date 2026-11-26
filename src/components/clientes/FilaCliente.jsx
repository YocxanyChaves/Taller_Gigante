import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { formatoColones, formatoTelefono } from "../../lib/formato";
import Placa from "../ui/Placa";

// La tarjeta de un cliente en "Buscar un cliente", a todo lo ancho y con aire:
// nombre, teléfono, sus placas y, si aplica, cuántos carros tiene en el
// taller y cuánto debe. Toda la tarjeta lleva a la ficha; al pasar el mouse se
// levanta y se marca en rojo. Rayita roja a la izquierda, placas en rojo y el
// botón siempre rojo (negro con letras rojas al pasar el mouse).

export default function FilaCliente({ cliente, retraso = 0 }) {
  const debe = Number(cliente.debe);

  return (
    <Link
      to={`/clientes/${cliente.id}`}
      style={{ "--retraso": `${retraso}ms` }}
      className="tarjeta-carro group animar-entrada flex flex-col gap-5 rounded-tarjeta border-2 border-l-[10px] border-linea border-l-rojo bg-tarjeta p-6 shadow-tarjeta hover:border-rojo hover:bg-rojo/[0.03] sm:p-8 md:flex-row md:items-center md:gap-8"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-bold break-words transition-colors group-hover:text-[#ff5a63]">{cliente.nombre}</h3>
          <p className="numeros mt-1 flex items-center gap-2 text-lg text-gris">
            <Phone aria-hidden="true" size={18} />
            {formatoTelefono(cliente.telefono)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {cliente.placas.length ? (
            cliente.placas.map((placa) => (
              <Placa key={placa} roja>
                {placa}
              </Placa>
            ))
          ) : (
            <span className="text-lg text-gris">Sin carros anotados</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 md:w-64">
        {debe > 0 && <span className="numeros text-xl font-bold text-rojo">Debe {formatoColones(debe)}</span>}
        {cliente.en_taller > 0 && (
          <span className="text-lg text-gris">
            {cliente.en_taller === 1 ? "🔧 1 carro en el taller" : `🔧 ${cliente.en_taller} carros en el taller`}
          </span>
        )}
        <span className="flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-rojo bg-rojo px-4 text-lg font-bold text-white transition-colors duration-200 group-hover:border-tinta group-hover:bg-tinta group-hover:text-[#ff5a63]">
          Ver el cliente
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
