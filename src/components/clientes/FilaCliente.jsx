import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { formatoColones, formatoTelefono } from "../../lib/formato";
import { apuntarVenom } from "../../lib/venom";
import { CapaVenom, MasaVenom } from "../ui/Venom";

// La tarjeta de un cliente en "Buscar un cliente", a todo lo ancho y con aire:
// nombre, teléfono, sus placas y, si aplica, cuántos carros tiene en el
// taller y cuánto debe. Rayita roja a la izquierda; el botón y las placas son
// rojos con letras blancas.
// Al pasar el mouse (efecto venom, ui/Venom): el rojo sale del botón y de
// cada placa a la vez, se junta y pinta toda la tarjeta; lo que era rojo (el
// botón y las placas) queda blanco con letras rojas, y el texto se pone
// blanco conforme la masa lo cubre.

export default function FilaCliente({ cliente, retraso = 0 }) {
  const origenes = [0, ...cliente.placas.map((_, i) => i + 1)];

  return (
    <Link
      to={`/clientes/${cliente.id}`}
      style={{ "--retraso": `${retraso}ms` }}
      onPointerEnter={apuntarVenom}
      onFocus={apuntarVenom}
      className="venom-activador venom-zona tarjeta-carro tarjeta-fuerte group animar-entrada block rounded-tarjeta border-2 border-l-[10px] border-linea border-l-rojo bg-tarjeta shadow-tarjeta transition-[border-color] duration-500 hover:border-rojo"
    >
      {/* Una masa por cada punto de donde sale el rojo: el botón (0) y cada placa. */}
      {origenes.map((o) => (
        <MasaVenom key={o} origen={o} />
      ))}
      <Contenido cliente={cliente} />
      {/* La misma tarjeta en blanco sobre rojo, que aparece conforme la masa la
          cubre (una copia por punto de salida; donde se juntan, se suman). */}
      {origenes.map((o) => (
        <CapaVenom key={o} origen={o}>
          <Contenido cliente={cliente} capa />
        </CapaVenom>
      ))}
    </Link>
  );
}

// Lo de adentro de la tarjeta. Va dos veces: normal, y en la copia del
// efecto (`capa`), con letras blancas y las placas blancas con letras rojas.
// En la copia el botón no se dibuja (el de verdad queda encima y se aclara
// solo), pero ocupa su lugar para que todo quede en el mismo sitio.
function Contenido({ cliente, capa = false }) {
  const debe = Number(cliente.debe);
  const gris = capa ? "text-white/90" : "text-gris";
  const placa = capa ? "border-white bg-white text-rojo" : "border-rojo bg-rojo text-white";

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-bold break-words">{cliente.nombre}</h3>
          <p className={`numeros mt-1 flex items-center gap-2 text-lg ${gris}`}>
            <Phone aria-hidden="true" size={18} />
            {formatoTelefono(cliente.telefono)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {cliente.placas.length ? (
            cliente.placas.map((p) => (
              <span
                key={p}
                className={`inline-block rounded-md border-2 px-3 py-1 text-lg font-bold tracking-[0.12em] whitespace-nowrap ${placa} ${
                  capa ? "" : "venom-origen"
                }`}
              >
                {p}
              </span>
            ))
          ) : (
            <span className={`text-lg ${gris}`}>Sin carros anotados</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-3 md:w-64">
        {debe > 0 && (
          <span className={`numeros text-xl font-bold ${capa ? "text-white" : "text-rojo"}`}>
            Debe {formatoColones(debe)}
          </span>
        )}
        {cliente.en_taller > 0 && (
          <span className={`text-lg ${gris}`}>
            {cliente.en_taller === 1 ? "🔧 1 carro en el taller" : `🔧 ${cliente.en_taller} carros en el taller`}
          </span>
        )}
        {capa ? (
          <span className="min-h-12" />
        ) : (
          <span className="venom-boton flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-rojo bg-rojo px-4 text-lg font-bold text-white">
            Ver el cliente
            <ArrowRight
              aria-hidden="true"
              size={22}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </span>
        )}
      </div>
    </div>
  );
}
