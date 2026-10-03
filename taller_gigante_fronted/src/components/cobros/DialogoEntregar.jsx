import { useState } from "react";
import { Banknote, CalendarClock, Clock, HandCoins } from "lucide-react";
import { formatoColones, montoDe } from "../../lib/formato";
import Dialogo from "../ui/Dialogo";
import Eleccion from "../ui/Eleccion";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";
import { CampoMonto, ElegirMetodo } from "./CamposPago";

// "Entregar y cobrar" (carro listo) o "Se llevó el carro" (no aprobó).
//   listo:       paga todo ahora, o en cuotas con un primer abono (puede ser 0).
//   no_aprobado: cobro de la revisión opcional; si hay, lo paga ahora o después.
// Se monta de nuevo cada vez que se abre, así arranca en blanco.

export default function DialogoEntregar({ trabajo, guardando, error, alGuardar, alCerrar }) {
  const noAprobo = trabajo.estado === "no_aprobado";
  const total = Number(trabajo.totales?.saldo ?? 0);

  const [modalidad, setModalidad] = useState(null); // "contado" | "cuotas"
  const [abono, setAbono] = useState("");
  const [cobro, setCobro] = useState("");
  const [metodo, setMetodo] = useState(null);
  const [nota, setNota] = useState("");
  const [intento, setIntento] = useState(false);

  // Lo que se paga hoy.
  let monto = 0;
  if (noAprobo) monto = modalidad === "contado" ? montoDe(cobro) : 0;
  else if (modalidad === "contado") monto = total;
  else if (modalidad === "cuotas") monto = montoDe(abono);

  const montoDeuda = noAprobo ? montoDe(cobro) : total;
  const necesitaModalidad = noAprobo ? montoDe(cobro) > 0 : total > 0;

  const errores = {
    modalidad: necesitaModalidad && !modalidad ? "Escoja una opción." : undefined,
    abono:
      modalidad === "cuotas" && !noAprobo && monto > total
        ? `El abono no puede ser mayor que el total (${formatoColones(total)}).`
        : undefined,
    metodo: monto > 0 && !metodo ? "Escoja cómo pagó." : undefined,
  };
  const valido = !Object.values(errores).some(Boolean);

  const guardar = () => {
    setIntento(true);
    if (!valido) return;
    alGuardar({
      modalidad: necesitaModalidad ? modalidad : null,
      monto,
      metodo: monto > 0 ? metodo : null,
      cobroRevision: noAprobo ? montoDe(cobro) : null,
      nota: nota.trim() || null,
    });
  };

  const opciones = noAprobo
    ? [
        { valor: "contado", titulo: "Lo pagó ahora", icono: Banknote },
        { valor: "cuotas", titulo: "Lo paga después", ayuda: "Queda debiendo", icono: Clock },
      ]
    : [
        { valor: "contado", titulo: "Paga todo ahora", ayuda: formatoColones(total), icono: Banknote },
        { valor: "cuotas", titulo: "Paga en cuotas", ayuda: "Abona una parte y el resto después", icono: CalendarClock },
      ];

  return (
    <Dialogo
      abierto
      titulo={noAprobo ? "Se llevó el carro" : "Entregar y cobrar"}
      alCerrar={alCerrar}
      alEnviar={guardar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" icono={HandCoins} disabled={guardando}>
            {guardando ? "Guardando…" : "Entregar el carro"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-5 text-tinta">
        {noAprobo ? (
          <>
            <p className="text-gris">No aprobó el arreglo. Si le cobra la revisión, anote cuánto.</p>
            <CampoMonto etiqueta="Cobro de la revisión" opcional autoFocus valor={cobro} alCambiar={setCobro} />
          </>
        ) : (
          <div className="rounded-tarjeta bg-suave px-5 py-4">
            <p className="text-lg text-gris">Total a cobrar</p>
            <p className="numeros text-4xl font-bold">{formatoColones(total)}</p>
          </div>
        )}

        {necesitaModalidad && (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-lg font-bold">¿Cómo paga?</legend>
            {opciones.map((o) => (
              <Eleccion key={o.valor} {...o} elegida={modalidad === o.valor} onClick={() => setModalidad(o.valor)} />
            ))}
            {intento && errores.modalidad && <p role="alert" className="font-bold text-rojo">{errores.modalidad}</p>}
          </fieldset>
        )}

        {!noAprobo && modalidad === "cuotas" && (
          <CampoMonto
            etiqueta="¿Cuánto abona hoy?"
            autoFocus
            valor={abono}
            alCambiar={setAbono}
            ayuda={monto < total ? `Queda debiendo ${formatoColones(total - monto)}` : undefined}
            error={errores.abono}
          />
        )}

        {monto > 0 && (
          <>
            <ElegirMetodo valor={metodo} alCambiar={setMetodo} />
            {intento && errores.metodo && <p role="alert" className="-mt-3 font-bold text-rojo">{errores.metodo}</p>}
          </>
        )}

        {montoDeuda > 0 && monto > 0 && (
          <Campo
            etiqueta="Nota"
            opcional
            placeholder="Por ejemplo: número de comprobante del SINPE"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
          />
        )}

        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
