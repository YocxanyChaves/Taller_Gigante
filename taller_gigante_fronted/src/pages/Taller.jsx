import { useCallback, useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { obtenerPlata, obtenerResumenTaller } from "../services/taller";
import { ESTADOS } from "../lib/estados";
import { formatoColones, mesCorto } from "../lib/formato";
import { mensajeError } from "../lib/errores";
import Encabezado from "../components/layout/Encabezado";
import TarjetaNumero from "../components/ui/TarjetaNumero";
import Pestanas from "../components/ui/Pestanas";
import Semaforo from "../components/ui/Semaforo";
import Aviso from "../components/ui/Aviso";
import Boton from "../components/ui/Boton";
import GraficoPlata from "../components/taller/GraficoPlata";

// "Cómo va el taller": solo para ver, aquí no se cambia nada. Arriba la plata
// del mes; luego el gráfico de los últimos meses (con su tabla) y cuántos
// carros hay por color del semáforo.

const RANGOS = [
  { valor: "6meses", texto: "Últimos 6 meses" },
  { valor: "anio", texto: "Este año" },
];

const GRUPOS = [
  { luz: "verde", texto: "Listos para recoger" },
  { luz: "amarillo", texto: "En revisión o reparación" },
  { luz: "rojo", texto: "Esperando respuesta o repuestos" },
  { luz: null, texto: "Citas y sin aprobar", estados: ["cita", "no_aprobado"] },
];

export default function Taller() {
  const [rango, setRango] = useState("6meses");
  const [meses, setMeses] = useState(null);
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState("");

  const cargar = useCallback(
    () =>
      Promise.all([obtenerPlata(rango), obtenerResumenTaller()])
        .then(([plata, res]) => {
          setMeses(plata);
          setResumen(res);
          setError("");
        })
        .catch((e) => setError(mensajeError(e))),
    [rango]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const esteMes = meses?.at(-1);
  const aproximada = meses?.some((m) => m.aproximada);

  return (
    <>
      <Encabezado titulo="Cómo va el taller">
        La plata y los carros de los últimos meses. Aquí solo se mira: no se cambia nada.
      </Encabezado>

      {error && (
        <Aviso
          tipo="alerta"
          titulo="No se pudieron cargar los datos"
          accion={
            <Boton variante="secundario" icono={RotateCw} onClick={cargar}>
              Intentar de nuevo
            </Boton>
          }
        >
          {error}
        </Aviso>
      )}

      {!error && (!meses || !resumen) && <p className="animate-pulse text-xl text-gris">Cargando…</p>}

      {meses && resumen && (
        <div className="flex flex-col gap-10">
          <div className="grid gap-4 sm:grid-cols-3">
            <TarjetaNumero etiqueta="Cobrado este mes" valor={esteMes?.cobrado ?? 0} formato={formatoColones} />
            <TarjetaNumero
              etiqueta="Por cobrar"
              valor={resumen.porCobrar}
              formato={formatoColones}
              color={resumen.porCobrar > 0 ? "rojo" : "tinta"}
              detalle="Lo que deben, de todos los meses"
              to="/cobros"
            />
            <TarjetaNumero
              etiqueta={`Ganancia del mes${esteMes?.aproximada ? "*" : ""}`}
              valor={esteMes?.ganancia ?? 0}
              formato={formatoColones}
              color="verde"
              detalle="De los carros entregados este mes"
            />
          </div>

          <section className="rounded-tarjeta border border-linea bg-tarjeta p-5 shadow-tarjeta md:p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold">La plata, mes por mes</h2>
              <Pestanas
                etiqueta="Qué meses ver"
                opciones={RANGOS.map((r) => ({ ...r, cantidad: null }))}
                valor={rango}
                alCambiar={setRango}
              />
            </div>

            <GraficoPlata meses={meses} />

            {aproximada && (
              <p className="mt-4 text-base text-gris">
                *Ganancia aproximada: faltan costos de algunos repuestos. Anótelos en «Me costó» al hacer el precio.
              </p>
            )}

            <details className="mt-5 border-t border-linea pt-4">
              <summary className="min-h-12 cursor-pointer py-2 text-lg font-bold">Ver los números en una tabla</summary>
              <div className="overflow-x-auto">
                <table className="numeros mt-3 w-full text-left text-lg">
                  <thead>
                    <tr className="border-b border-linea text-gris">
                      <th className="py-2 pr-4 font-normal">Mes</th>
                      <th className="py-2 pr-4 text-right font-normal">Cobrado</th>
                      <th className="py-2 pr-4 text-right font-normal">Por cobrar</th>
                      <th className="py-2 text-right font-normal">Ganancia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meses.map((m) => (
                      <tr key={m.mes} className="border-b border-linea last:border-b-0">
                        <td className="py-2 pr-4 capitalize">
                          {mesCorto(m.mes)} {m.mes.slice(0, 4)}
                        </td>
                        <td className="py-2 pr-4 text-right">{formatoColones(m.cobrado)}</td>
                        <td className="py-2 pr-4 text-right">{formatoColones(m.porCobrar)}</td>
                        <td className="py-2 text-right">
                          {formatoColones(m.ganancia)}
                          {m.aproximada && "*"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold">Los carros</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-tarjeta border border-linea bg-tarjeta p-5 shadow-tarjeta">
                <p className="mb-3 text-lg text-gris">En el taller ahora</p>
                <ul className="flex flex-col gap-3">
                  {GRUPOS.map((g) => {
                    const cantidad = Object.entries(resumen.porEstado)
                      .filter(([estado]) => (g.estados ? g.estados.includes(estado) : ESTADOS[estado]?.luz === g.luz))
                      .reduce((suma, [, n]) => suma + n, 0);
                    return (
                      <li key={g.texto} className="flex items-center gap-3 text-lg">
                        <Semaforo luz={g.luz} />
                        <span className="flex-1">{g.texto}</span>
                        <span className="numeros text-xl font-bold">{cantidad}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="grid gap-4">
                <TarjetaNumero etiqueta="Carros recibidos este mes" valor={resumen.recibidosMes} />
                <TarjetaNumero etiqueta="Carros entregados este mes" valor={resumen.entregadosMes} />
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
