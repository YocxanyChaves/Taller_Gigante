import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { formatoTelefono, formatoKmYMillas, fechaLarga, soloDigitos } from "../../lib/formato";
import { TEXTO_GASOLINA } from "../../lib/llegada";
import Desplegable from "../ui/Desplegable";

// El carro, el cliente (con botón para llamar) y cómo llegó, usando todo el
// ancho: arriba y al centro el cliente; «Qué dijo» justificado a todo lo
// ancho; los demás datos en cuadritos parejos y, abajo del todo, el botón de
// llamar a lo largo de toda la sección.

function Dato({ etiqueta, emoji, children, ancho = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-tarjeta bg-fondo p-5 text-center ${
        ancho ? "basis-full" : "min-w-[14rem] flex-1"
      }`}
    >
      <dt className="etiqueta">
        {emoji && <span aria-hidden="true" className="mr-1.5 not-italic">{emoji}</span>}
        {etiqueta}
      </dt>
      <dd className="mt-2 w-full text-xl break-words">{children}</dd>
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
        </div>

        {/* Los cuadritos se reparten todo el ancho, sin dejar huecos a la derecha. */}
        <dl className="flex flex-wrap gap-4">
          <Dato etiqueta="Qué dijo el cliente" emoji="💬" ancho>
            {/* Justificado: todos los renglones del mismo largo, de orilla a orilla. */}
            <p className="w-full text-justify text-2xl whitespace-pre-line [text-align-last:left] [hyphens:auto]" lang="es">
              {trabajo.problema_reportado}
            </p>
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
              <p className="w-full text-justify whitespace-pre-line [text-align-last:left] [hyphens:auto]" lang="es">
                {trabajo.notas_recepcion}
              </p>
            </Dato>
          )}
        </dl>

        {/* Llamar, abajo y a todo lo ancho de la sección. */}
        {telefono.length === 8 && (
          <a
            href={`tel:+506${telefono}`}
            className="flex min-h-16 w-full items-center justify-center gap-2.5 rounded-control border-2 border-linea-fuerte bg-tarjeta px-6 text-xl font-bold transition-[border-color,translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-tinta hover:shadow-elevada"
          >
            <Phone aria-hidden="true" size={22} />
            Llamar a {cliente?.nombre ?? "el cliente"} al {formatoTelefono(telefono)}
          </a>
        )}
      </div>
    </Desplegable>
  );
}
