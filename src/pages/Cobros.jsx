import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, HandCoins, MessageCircle, PartyPopper, RotateCw } from "lucide-react";
import { obtenerCobros } from "../services/cobros";
import { formatoColones, nombreCarro, fechaLarga, diasDesde, textoDias } from "../lib/formato";
import { linkCliente } from "../lib/taller";
import { mensajeRecordatorio } from "../lib/whatsapp";
import { mensajeError } from "../lib/errores";
import useRefrescar from "../lib/useRefrescar";
import Encabezado from "../components/layout/Encabezado";
import TarjetaNumero from "../components/ui/TarjetaNumero";
import Placa from "../components/ui/Placa";
import Insignia from "../components/ui/Insignia";
import Aviso from "../components/ui/Aviso";
import Boton from "../components/ui/Boton";
import Vacio from "../components/ui/Vacio";
import DialogoWhatsApp from "../components/ui/DialogoWhatsApp";
import DialogoAbono from "../components/cobros/DialogoAbono";

// "Cobrar y entregar": arriba cuánto le deben al taller; luego los carros que
// esperan que los recojan (se entregan desde su ficha) y quién debe, con
// botones para registrar un abono o recordarle por WhatsApp.

export default function Cobros() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [abonando, setAbonando] = useState(null); // una deuda
  const [recordando, setRecordando] = useState(null); // una deuda

  const cargar = useCallback(
    () =>
      obtenerCobros()
        .then((d) => {
          setDatos(d);
          setError("");
        })
        .catch((e) => setError(mensajeError(e))),
    []
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  useRefrescar(cargar, 60000);

  const porCobrar = datos?.deudas.reduce((suma, d) => suma + d.saldo, 0) ?? 0;

  return (
    <>
      <Encabezado titulo="Cobrar y entregar">
        Entregue los carros listos y anote los abonos de quien quedó debiendo.
      </Encabezado>

      {error && (
        <Aviso
          tipo="alerta"
          titulo="No se pudieron cargar los cobros"
          accion={
            <Boton variante="secundario" icono={RotateCw} onClick={cargar}>
              Intentar de nuevo
            </Boton>
          }
        >
          {error}
        </Aviso>
      )}

      {!error && datos === null && <p className="animate-pulse text-xl text-gris">Cargando los cobros…</p>}

      {datos && (
        <div className="flex flex-col gap-10">
          <div className="grid gap-4 sm:grid-cols-2">
            <TarjetaNumero
              etiqueta="Por cobrar"
              valor={porCobrar}
              formato={formatoColones}
              color={porCobrar > 0 ? "rojo" : "tinta"}
              detalle={
                datos.deudas.length === 1 ? "1 trabajo con saldo" : `${datos.deudas.length} trabajos con saldo`
              }
            />
            <TarjetaNumero
              etiqueta="Carros para entregar"
              valor={datos.porEntregar.length}
              color={datos.porEntregar.length > 0 ? "verde" : "tinta"}
              detalle="Listos o que no aprobaron"
            />
          </div>

          <section>
            <h2 className="mb-1 text-2xl font-bold">Para entregar</h2>
            <p className="mb-4 text-lg text-gris">Toque el carro y use «Entregar y cobrar» cuando el cliente venga.</p>
            {datos.porEntregar.length === 0 ? (
              <p className="rounded-tarjeta border-2 border-dashed border-linea-fuerte px-6 py-5 text-lg text-gris">
                No hay carros esperando que los recojan.
              </p>
            ) : (
              <div className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
                {datos.porEntregar.map((t, i) => (
                  <FilaEntregar key={t.id} trabajo={t} retraso={Math.min(i, 8) * 45} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-1 text-2xl font-bold">Quién debe</h2>
            <p className="mb-4 text-lg text-gris">Del que debe hace más tiempo al más reciente.</p>
            {datos.deudas.length === 0 ? (
              <Vacio icono={PartyPopper} titulo="Nadie le debe al taller">
                Cuando alguien pague en cuotas, aquí va a aparecer lo que falta.
              </Vacio>
            ) : (
              <div className="flex flex-col gap-4">
                {datos.deudas.map((d, i) => (
                  <TarjetaDeuda
                    key={d.orden_id}
                    deuda={d}
                    retraso={Math.min(i, 8) * 45}
                    alAbonar={() => setAbonando(d)}
                    alRecordar={() => setRecordando(d)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {abonando && (
        <DialogoAbono
          ordenId={abonando.orden_id}
          saldo={abonando.saldo}
          carro={`${abonando.cliente_nombre ?? "Sin dueño"} · ${abonando.placa?.toUpperCase() ?? ""}`}
          alCerrar={() => setAbonando(null)}
          alGuardado={async () => {
            await cargar();
            setAbonando(null);
          }}
        />
      )}

      <DialogoWhatsApp
        abierto={recordando !== null}
        titulo="Recordarle el saldo"
        telefono={recordando?.cliente_telefono}
        nombre={recordando?.cliente_nombre}
        mensaje={
          recordando
            ? mensajeRecordatorio({
                cliente: recordando.cliente_nombre,
                vehiculo: recordando,
                saldo: recordando.saldo,
                link: linkCliente(recordando.token_publico),
              })
            : ""
        }
        alCerrar={() => setRecordando(null)}
      />
    </>
  );
}

function FilaEntregar({ trabajo, retraso }) {
  const { vehiculo } = trabajo;
  return (
    <Link
      to={`/trabajos/${trabajo.id}`}
      style={{ "--retraso": `${retraso}ms` }}
      className="group animar-entrada flex items-center gap-4 border-b border-linea px-5 py-4 transition-colors duration-200 last:border-b-0 hover:bg-fondo md:px-6"
    >
      <span className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-6">
        <span className="md:w-36 md:shrink-0">
          <Placa>{vehiculo?.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
        </span>
        <span className="flex min-w-0 flex-col md:flex-1">
          <span className="truncate text-lg font-bold">
            {nombreCarro(vehiculo)} · {vehiculo?.cliente?.nombre ?? "Sin dueño"}
          </span>
          <Insignia estado={trabajo.estado} />
        </span>
        {trabajo.total > 0 && <span className="numeros text-xl font-bold">{formatoColones(trabajo.total)}</span>}
      </span>
      <ChevronRight
        aria-hidden="true"
        size={24}
        className="shrink-0 text-gris transition-transform duration-200 group-hover:translate-x-1"
      />
    </Link>
  );
}

function TarjetaDeuda({ deuda, retraso, alAbonar, alRecordar }) {
  const dias = diasDesde(deuda.fecha_entrega);
  return (
    <article
      style={{ "--retraso": `${retraso}ms` }}
      className="animar-entrada flex flex-col gap-4 rounded-tarjeta border border-linea bg-tarjeta p-5 shadow-tarjeta md:flex-row md:items-center md:justify-between md:px-6"
    >
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <Placa>{deuda.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
          {deuda.cliente_id ? (
            <Link
              to={`/clientes/${deuda.cliente_id}`}
              className="text-lg font-bold underline decoration-linea-fuerte underline-offset-4 hover:decoration-tinta"
            >
              {deuda.cliente_nombre}
            </Link>
          ) : (
            <span className="text-lg font-bold">Sin dueño anotado</span>
          )}
        </div>
        <p className="text-base text-gris">
          {nombreCarro(deuda)} · Entregado {dias === 0 ? "hoy" : `hace ${textoDias(dias)}`}
          {deuda.ultimo_abono && ` · Último abono: ${fechaLarga(deuda.ultimo_abono)}`}
        </p>
        <Link to={`/trabajos/${deuda.orden_id}`} className="self-start text-base font-bold text-gris underline underline-offset-4 hover:text-tinta">
          Ver el trabajo
        </Link>
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <p className="md:text-right">
          <span className="numeros block text-3xl font-bold text-rojo">{formatoColones(deuda.saldo)}</span>
          <span className="numeros text-base text-gris">de {formatoColones(deuda.total)}</span>
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Boton variante="secundario" icono={HandCoins} onClick={alAbonar}>
            Registrar abono
          </Boton>
          <Boton variante="whatsapp" icono={MessageCircle} onClick={alRecordar}>
            Recordar por WhatsApp
          </Boton>
        </div>
      </div>
    </article>
  );
}
