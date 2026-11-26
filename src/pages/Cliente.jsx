import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Car, MessageCircle, Pencil, Phone, RotateCw, SearchX, Trash2 } from "lucide-react";
import { obtenerCliente } from "../services/clientes";
import { formatoColones, formatoTelefono, mesYAnio, soloDigitos } from "../lib/formato";
import { enlaceWhatsApp, mensajeSaludo } from "../lib/whatsapp";
import { mensajeError } from "../lib/errores";
import Boton from "../components/ui/Boton";
import Aviso from "../components/ui/Aviso";
import Vacio from "../components/ui/Vacio";
import CarroCliente from "../components/clientes/CarroCliente";
import DialogoCliente from "../components/clientes/DialogoCliente";
import DialogoBorrarCliente from "../components/clientes/DialogoBorrarCliente";

// Ficha del cliente: quién es, el botón rojo (a todo lo ancho) para agregarle
// un carro, lo que debe y sus carros con el historial de cada uno. Abajo,
// siempre abiertos, el contacto y las otras acciones (cambiar datos, borrar).

export default function Cliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(undefined); // undefined = cargando, null = no existe
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const navegar = useNavigate();

  const cargar = useCallback(
    () =>
      obtenerCliente(id)
        .then((datos) => {
          setCliente(datos);
          setError("");
        })
        .catch((e) => setError(mensajeError(e))),
    [id]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (error) {
    return (
      <Aviso
        tipo="alerta"
        titulo="No se pudo cargar el cliente"
        accion={
          <Boton variante="secundario" icono={RotateCw} onClick={cargar}>
            Intentar de nuevo
          </Boton>
        }
      >
        {error}
      </Aviso>
    );
  }

  if (cliente === undefined) {
    return <p className="animate-pulse text-xl text-gris">Cargando el cliente…</p>;
  }

  if (cliente === null) {
    return (
      <Vacio
        icono={SearchX}
        titulo="No encontramos ese cliente"
        accion={
          <Boton variante="secundario" to="/clientes">
            Buscar un cliente
          </Boton>
        }
      >
        Puede que se haya borrado o que el enlace esté mal.
      </Vacio>
    );
  }

  const telefono = soloDigitos(cliente.telefono).slice(-8);
  // La base no deja borrar un cliente con trabajos sin terminar.
  const enTaller = cliente.vehiculos.some((v) => v.ordenes.some((o) => !["entregado", "cancelado"].includes(o.estado)));

  return (
    <>
      <header className="mb-6">
        <p className="etiqueta mb-2">Cliente</p>
        <h1 className="text-4xl font-bold break-words">{cliente.nombre}</h1>
        <p className="numeros mt-2 text-xl text-gris">{formatoTelefono(cliente.telefono)}</p>
      </header>

      <Boton icono={Car} to={`/trabajos/nuevo?cliente=${cliente.id}`} anchoCompleto className="mb-8 min-h-16 text-xl">
        Agregar un carro de este cliente
      </Boton>

      {cliente.debe > 0 && (
        <div className="mb-8">
          <Aviso tipo="alerta" titulo={`Debe ${formatoColones(cliente.debe)}`}>
            De trabajos ya entregados. Abajo, en cada carro, se ve cuál trabajo tiene saldo.
          </Aviso>
        </div>
      )}

      <section aria-labelledby="carros" className="flex flex-col gap-8">
        <h2 id="carros" className="text-2xl font-bold">
          {cliente.vehiculos.length === 1 ? "🚗 Su carro" : "🚗 Sus carros"}
        </h2>
        {cliente.vehiculos.length === 0 ? (
          <Vacio icono={Car} titulo="No tiene carros anotados">
            Toque «Agregar un carro de este cliente» para anotar el primero.
          </Vacio>
        ) : (
          cliente.vehiculos.map((v, i) => (
            <CarroCliente key={v.id} vehiculo={v} retraso={Math.min(i, 4) * 60} alCambio={cargar} />
          ))
        )}
      </section>

      {/* Abajo, siempre abierto: cómo contactarlo y las acciones de poco uso. */}
      <div className="mt-12 grid items-start gap-6 border-t-2 border-linea pt-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-tarjeta border-2 border-linea bg-tarjeta shadow-tarjeta">
          <h2 className="border-b border-linea px-6 py-4 text-2xl font-bold">📞 Contacto</h2>
          <div className="flex flex-col gap-6 p-6">
            {telefono.length === 8 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={`tel:+506${telefono}`}
                  className="flex min-h-14 items-center justify-center gap-2.5 rounded-control border-2 border-linea-fuerte px-5 text-lg font-bold transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-tinta"
                >
                  <Phone aria-hidden="true" size={22} />
                  Llamar al {formatoTelefono(telefono)}
                </a>
                <Boton variante="whatsapp" icono={MessageCircle} href={enlaceWhatsApp(telefono, mensajeSaludo(cliente))}>
                  Escribir por WhatsApp
                </Boton>
              </div>
            ) : (
              <p className="text-lg text-rojo">
                El teléfono no tiene 8 números. Toque «Cambiar datos» para corregirlo.
              </p>
            )}

            <dl className="grid gap-5 sm:grid-cols-3">
              <Dato etiqueta="Correo">{cliente.correo || "No anotado"}</Dato>
              <Dato etiqueta="Dirección">{cliente.direccion || "No anotada"}</Dato>
              <Dato etiqueta="Cliente desde">{mesYAnio(cliente.fecha_ingreso)}</Dato>
            </dl>
          </div>
        </section>

        <section className="rounded-tarjeta border-2 border-linea bg-tarjeta shadow-tarjeta">
          <h2 className="border-b border-linea px-6 py-4 text-2xl font-bold">⚙️ Otras acciones</h2>
          <div className="flex flex-col gap-3 p-6">
            <Boton variante="secundario" icono={Pencil} anchoCompleto onClick={() => setEditando(true)}>
              Cambiar datos
            </Boton>
            <Boton variante="peligro" icono={Trash2} anchoCompleto onClick={() => setBorrando(true)} disabled={enTaller}>
              Borrar este cliente
            </Boton>
            {enTaller && (
              <p className="text-base text-gris">
                Para borrarlo, primero entregue o cancele el carro que tiene en el taller.
              </p>
            )}
          </div>
        </section>
      </div>

      {editando && (
        <DialogoCliente
          cliente={cliente}
          alCerrar={() => setEditando(false)}
          alGuardado={async () => {
            await cargar();
            setEditando(false);
          }}
        />
      )}

      {borrando && (
        <DialogoBorrarCliente
          cliente={cliente}
          alCerrar={() => setBorrando(false)}
          alBorrado={() => navegar("/clientes", { replace: true })}
        />
      )}
    </>
  );
}

function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-base text-gris">{etiqueta}</dt>
      <dd className="mt-0.5 text-lg break-words whitespace-pre-line">{children}</dd>
    </div>
  );
}
