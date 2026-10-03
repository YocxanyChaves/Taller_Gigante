import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Car, MessageCircle, Pencil, Phone, RotateCw, SearchX } from "lucide-react";
import { obtenerCliente } from "../services/clientes";
import { formatoColones, formatoTelefono, mesYAnio, soloDigitos } from "../lib/formato";
import { enlaceWhatsApp, mensajeSaludo } from "../lib/whatsapp";
import { mensajeError } from "../lib/errores";
import Boton from "../components/ui/Boton";
import Aviso from "../components/ui/Aviso";
import Vacio from "../components/ui/Vacio";
import CarroCliente from "../components/clientes/CarroCliente";
import DialogoCliente from "../components/clientes/DialogoCliente";

// Ficha del cliente: quién es y cómo contactarlo, lo que debe, sus carros con
// el historial de cada uno y el botón para recibirle un carro.

export default function Cliente() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(undefined); // undefined = cargando, null = no existe
  const [error, setError] = useState("");
  const [editando, setEditando] = useState(false);

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

  return (
    <>
      <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="etiqueta mb-2">Cliente</p>
          <h1 className="text-4xl font-bold">{cliente.nombre}</h1>
          <p className="numeros mt-2 text-xl text-gris">{formatoTelefono(cliente.telefono)}</p>
        </div>
        <Boton icono={Car} to={`/trabajos/nuevo?cliente=${cliente.id}`}>
          Recibir un carro de este cliente
        </Boton>
      </header>

      {cliente.debe > 0 && (
        <div className="mb-6">
          <Aviso tipo="alerta" titulo={`Debe ${formatoColones(cliente.debe)}`}>
            De trabajos ya entregados. Abajo, en cada carro, se ve cuál trabajo tiene saldo.
          </Aviso>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="flex flex-col gap-6">
          <h2 className="sr-only">Carros</h2>
          {cliente.vehiculos.length === 0 ? (
            <Vacio icono={Car} titulo="No tiene carros anotados">
              Toque «Recibir un carro de este cliente» para anotar el primero.
            </Vacio>
          ) : (
            cliente.vehiculos.map((v, i) => <CarroCliente key={v.id} vehiculo={v} retraso={Math.min(i, 4) * 60} />)
          )}
        </section>

        <aside className="flex flex-col gap-6">
          <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
            <h2 className="border-b border-linea px-6 py-4 text-xl font-bold">Contacto</h2>
            <div className="flex flex-col gap-3 p-6">
              {telefono.length === 8 ? (
                <>
                  <a
                    href={`tel:+506${telefono}`}
                    className="flex min-h-14 items-center justify-center gap-2.5 rounded-control border-2 border-linea-fuerte px-5 text-lg font-bold transition-colors hover:border-tinta"
                  >
                    <Phone aria-hidden="true" size={22} />
                    Llamar
                  </a>
                  <Boton variante="whatsapp" icono={MessageCircle} href={enlaceWhatsApp(telefono, mensajeSaludo(cliente))}>
                    Escribir por WhatsApp
                  </Boton>
                </>
              ) : (
                <p className="text-lg text-rojo">
                  El teléfono no tiene 8 números. Toque «Cambiar datos» para corregirlo.
                </p>
              )}

              <dl className="mt-3 flex flex-col gap-4">
                <Dato etiqueta="Correo">{cliente.correo || "No anotado"}</Dato>
                <Dato etiqueta="Dirección">{cliente.direccion || "No anotada"}</Dato>
                <Dato etiqueta="Cliente desde">{mesYAnio(cliente.fecha_ingreso)}</Dato>
              </dl>
            </div>
          </section>

          <Boton variante="gris" icono={Pencil} className="justify-start" onClick={() => setEditando(true)}>
            Cambiar datos
          </Boton>
        </aside>
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
