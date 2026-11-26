import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { formatoTelefono, formatoKmYMillas, fechaLarga, soloDigitos } from "../../lib/formato";
import { TEXTO_GASOLINA } from "../../lib/llegada";
import Desplegable from "../ui/Desplegable";

// El carro, el cliente (con botón para llamar) y cómo llegó, usando todo el
// ancho: arriba y al centro lo importante (el cliente y qué dijo); abajo, los
// demás datos en cuadritos parejos.

function Dato({ etiqueta, emoji, children, ancho = false }) {
  return (
    <div className={`flex flex-col items-center rounded-tarjeta bg-fondo p-5 text-center ${ancho ? "col-span-full" : ""}`}>
      <dt className="etiqueta">
        {emoji && <span aria-hidden="true" className="mr-1.5 not-italic">{emoji}</span>}
        {etiqueta}
      </dt>
      <dd className="mt-2 text-xl break-words">{children}</dd>
    </div>
  );
}

export default function DatosTrabajo({ trabajo }) {
  const cliente = trabajo.vehiculo?.cliente;
  const telefono = soloDigitos(cliente?.telefono).slice(-8);

  return (
    <Desplegable emoji="📋" titulo="Datos" resumen={`Cliente: ${cliente?.nombre ?? "sin dueño anotado"}`}>
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="etiqueta">Cliente</p>
          {cliente ? (
            <Link
              to={`/clientes/${cliente.id}`}
              className="text-3xl font-bold break-words underline decoration-linea-fuerte underline-offset-[6px] transition-colors hover:text-rojo hover:decoration-rojo"
            >
              {cliente.nombre}
            </Link>
          ) : (
            <p className="text-3xl font-bold">Sin dueño anotado</p>
          )}
          {telefono.length === 8 && (
            <a
              href={`tel:+506${telefono}`}
              className="flex min-h-14 items-center gap-2 rounded-control border-2 border-linea-fuerte px-6 text-lg font-bold transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-tinta"
            >
              <Phone aria-hidden="true" size={20} />
              Llamar al {formatoTelefono(telefono)}
            </a>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Dato etiqueta="Qué dijo el cliente" emoji="💬" ancho>
            <span className="text-2xl whitespace-pre-line">{trabajo.problema_reportado}</span>
          </Dato>
          {trabajo.estado === "cita" && trabajo.fecha_cita && (
            <Dato etiqueta="Cita" emoji="📅">
              {fechaLarga(trabajo.fecha_cita)}
            </Dato>
          )}
          <Dato etiqueta="Anotado" emoji="🗓️">
            {fechaLarga(trabajo.fecha_ingreso)}
          </Dato>
          {trabajo.vehiculo?.tipo_motor && (
            <Dato etiqueta="Motor" emoji="⚙️">
              {trabajo.vehiculo.tipo_motor}
            </Dato>
          )}
          {trabajo.km_entrada != null && (
            <Dato etiqueta="Kilometraje al llegar" emoji="🧭">
              <span className="numeros">
                {formatoKmYMillas(trabajo.km_entrada, trabajo.unidad_distancia, trabajo.millas_entrada)}
              </span>
            </Dato>
          )}
          {trabajo.nivel_combustible && (
            <Dato etiqueta="Gasolina al llegar" emoji="⛽">
              {TEXTO_GASOLINA[trabajo.nivel_combustible]}
            </Dato>
          )}
          {trabajo.notas_recepcion && (
            <Dato etiqueta="Cómo llegó" emoji="📝" ancho>
              <span className="whitespace-pre-line">{trabajo.notas_recepcion}</span>
            </Dato>
          )}
        </dl>
      </div>
    </Desplegable>
  );
}
