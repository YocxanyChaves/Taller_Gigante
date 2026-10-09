import { useState } from "react";
import { HandCoins } from "lucide-react";
import { textoMetodo } from "../../services/cobros";
import { formatoColones, fechaLarga, nombreCarro } from "../../lib/formato";
import Boton from "../ui/Boton";
import DialogoAbono from "../cobros/DialogoAbono";

// Pagos de un trabajo: cada abono, lo pagado y lo que falta. Si ya se entregó
// y queda saldo, el botón para registrar otro abono.

export default function Pagos({ trabajo, alCambio }) {
  const [abonando, setAbonando] = useState(false);
  const { pagos, totales } = trabajo;
  const total = Number(totales?.total ?? 0);
  const pagado = Number(totales?.pagado ?? 0);
  const saldo = Number(totales?.saldo ?? 0);
  const puedeAbonar = trabajo.estado === "entregado" && saldo > 0;

  if (trabajo.estado !== "entregado" && pagos.length === 0) return null;

  return (
    <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
      <h2 className="border-b border-linea px-6 py-4 text-xl font-bold">
        Pagos
        {trabajo.modalidad_pago === "cuotas" && <span className="ml-2 font-normal text-gris">· en cuotas</span>}
      </h2>
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
    </section>
  );
}
