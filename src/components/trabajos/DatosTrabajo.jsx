import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { formatoTelefono, formatoKm, fechaLarga, soloDigitos } from "../../lib/formato";
import { TEXTO_GASOLINA } from "../../lib/llegada";
import Desplegable from "../ui/Desplegable";

// El carro, el cliente (con botón para llamar) y cómo llegó.

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-base text-gris">{etiqueta}</dt>
      <dd className="mt-0.5 text-lg break-words">{children}</dd>
    </div>
  );
}

export default function DatosTrabajo({ trabajo }) {
  const cliente = trabajo.vehiculo?.cliente;
  const telefono = soloDigitos(cliente?.telefono).slice(-8);

  return (
    <Desplegable titulo="Datos" resumen={`Cliente: ${cliente?.nombre ?? "sin dueño anotado"}`}>
      <dl className="flex flex-col gap-4 p-6">
        <Dato etiqueta="Cliente">
          {cliente ? (
            <Link to={`/clientes/${cliente.id}`} className="font-bold underline decoration-linea-fuerte underline-offset-4 hover:decoration-tinta">
              {cliente.nombre}
            </Link>
          ) : (
            <span className="font-bold">Sin dueño anotado</span>
          )}
          {telefono.length === 8 && (
            <a
              href={`tel:+506${telefono}`}
              className="mt-2 flex min-h-12 w-fit items-center gap-2 rounded-control border-2 border-linea-fuerte px-4 font-bold transition-colors hover:border-tinta"
            >
              <Phone aria-hidden="true" size={20} />
              Llamar al {formatoTelefono(telefono)}
            </a>
          )}
        </Dato>
        <Dato etiqueta="Qué dijo el cliente">
          <span className="whitespace-pre-line">{trabajo.problema_reportado}</span>
        </Dato>
        {trabajo.estado === "cita" && trabajo.fecha_cita && (
          <Dato etiqueta="Cita">{fechaLarga(trabajo.fecha_cita)}</Dato>
        )}
        <Dato etiqueta="Anotado">{fechaLarga(trabajo.fecha_ingreso)}</Dato>
        {trabajo.km_entrada != null && <Dato etiqueta="Kilometraje al llegar">{formatoKm(trabajo.km_entrada)}</Dato>}
        {trabajo.nivel_combustible && (
          <Dato etiqueta="Gasolina al llegar">{TEXTO_GASOLINA[trabajo.nivel_combustible]}</Dato>
        )}
        {trabajo.notas_recepcion && (
          <Dato etiqueta="Cómo llegó">
            <span className="whitespace-pre-line">{trabajo.notas_recepcion}</span>
          </Dato>
        )}
      </dl>
    </Desplegable>
  );
}
