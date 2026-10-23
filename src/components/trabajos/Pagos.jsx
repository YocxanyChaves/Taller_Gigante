import { useState } from "react";
import { CalendarClock, HandCoins } from "lucide-react";
import { textoMetodo } from "../../services/cobros";
import { formatoColones, fechaLarga, nombreCarro, diasParaPagar } from "../../lib/formato";
import Boton from "../ui/Boton";
import Desplegable from "../ui/Desplegable";
import DialogoAbono from "../cobros/DialogoAbono";
import DialogoProximoPago from "../cobros/DialogoProximoPago";
import ProximoPago from "../cobros/ProximoPago";

// Pagos de un trabajo: cada abono, lo pagado y lo que falta. Si ya se entregó
// y queda saldo, cuándo es el próximo pago (con botón para cambiar la fecha) y
// el botón para registrar otro abono. Cerrado, dice si debe.

// Para la línea de resumen del desplegable cerrado.
function textoResumenPago(faltan) {
  if (faltan === null) return null;
  if (faltan < 0) return "Pago atrasado";
  if (faltan === 0) return "Le toca pagar hoy";
  return faltan === 1 ? "Paga mañana" : `Paga en ${faltan} días`;
}

export default function Pagos({ trabajo, alCambio }) {
  const [abonando, setAbonando] = useState(false);
  const [cambiandoFecha, setCambiandoFecha] = useState(false);
  const { pagos, totales } = trabajo;
  const total = Number(totales?.total ?? 0);
  const pagado = Number(totales?.pagado ?? 0);
  const saldo = Number(totales?.saldo ?? 0);
  const puedeAbonar = trabajo.estado === "entregado" && saldo > 0;

  if (trabajo.estado !== "entregado" && pagos.length === 0) return null;

  // Se entregó sin cobrar nada (no aprobó y no se cobró la revisión): una sola
  // línea, sin "Total ₡0 · Pagado completo ✓" que confunde.
  if (total === 0 && pagos.length === 0) {
    return (
      <Desplegable titulo="Pagos" resumen="No se le cobró nada">
        <p className="p-6 text-lg text-gris">No se le cobró nada.</p>
      </Desplegable>
    );
  }

  const resumen = [
    trabajo.modalidad_pago === "cuotas" ? "En cuotas" : null,
    saldo > 0 ? `Debe ${formatoColones(saldo)}` : "Pagado completo ✓",
    puedeAbonar ? textoResumenPago(diasParaPagar(trabajo.fecha_proximo_pago)) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Desplegable titulo="Pagos" resumen={resumen}>
      <div className="flex flex-col gap-4 p-6">
        {pagos.length === 0 ? (
          <p className="text-lg text-gris">Todavía no ha pagado nada.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pagos.map((p) => (
              <li key={p.id} className="flex items-start justify-between gap-3">
                <span className="flex flex-col">
                  <span className="text-lg first-letter:uppercase">{fechaLarga(p.pagado_en)}</span>
                  <span className="text-base text-gris">
                    {textoMetodo(p.metodo)}
                    {p.nota && ` · ${p.nota}`}
                  </span>
                </span>
                <span className="numeros text-lg font-bold">{formatoColones(p.monto)}</span>
              </li>
            ))}
          </ul>
        )}

        <dl className="flex flex-col gap-1 border-t border-linea pt-4 text-lg">
          <div className="flex justify-between">
            <dt className="text-gris">Total</dt>
            <dd className="numeros">{formatoColones(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gris">Pagado</dt>
            <dd className="numeros">{formatoColones(pagado)}</dd>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <dt>{saldo > 0 ? "Debe" : "Pagado completo"}</dt>
            <dd className={`numeros ${saldo > 0 ? "text-rojo" : "text-verde-texto"}`}>
              {saldo > 0 ? formatoColones(saldo) : "✓"}
            </dd>
          </div>
        </dl>

        {puedeAbonar && (
          <div className="flex flex-col items-start gap-2">
            {trabajo.fecha_proximo_pago ? (
              <ProximoPago dia={trabajo.fecha_proximo_pago} />
            ) : (
              <p className="text-base text-gris">No se ha anotado cuándo es el próximo pago.</p>
            )}
            <Boton variante="gris" icono={CalendarClock} className="px-3" onClick={() => setCambiandoFecha(true)}>
              {trabajo.fecha_proximo_pago ? "Cambiar la fecha del próximo pago" : "Anotar la fecha del próximo pago"}
            </Boton>
          </div>
        )}

        {puedeAbonar && (
          <Boton variante="secundario" icono={HandCoins} onClick={() => setAbonando(true)}>
            Registrar abono
          </Boton>
        )}
      </div>

      {abonando && (
        <DialogoAbono
          ordenId={trabajo.id}
          saldo={saldo}
          carro={`${nombreCarro(trabajo.vehiculo)} ${trabajo.vehiculo?.placa?.toUpperCase() ?? ""}`.trim()}
          alCerrar={() => setAbonando(false)}
          alGuardado={async () => {
            await alCambio();
            setAbonando(false);
          }}
        />
      )}

      {cambiandoFecha && (
        <DialogoProximoPago
          ordenId={trabajo.id}
          dia={trabajo.fecha_proximo_pago}
          alCerrar={() => setCambiandoFecha(false)}
          alGuardado={async () => {
            await alCambio();
            setCambiandoFecha(false);
          }}
        />
      )}
    </Desplegable>
  );
}
