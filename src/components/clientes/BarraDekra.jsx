import { useState } from "react";
import { Check } from "lucide-react";
import { calcularEstadoDekra } from "../../lib/dekra";
import { marcarDekra } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";
import Semaforo from "../ui/Semaforo";
import Boton from "../ui/Boton";

// La revisión técnica (DEKRA) de un carro, en su propia tarjeta con los
// colores del semáforo según cuánto falta:
//   🟢 verde: falta más de 2 meses (o ya la pasó este año).
//   🟡 amarillo: faltan 2 meses o menos para que le toque.
//   🔴 rojo: ya le toca (está en su mes), con el botón «Ya pasó DEKRA».
// La barra se va llenando conforme se acerca el mes.

const DIA = 1000 * 60 * 60 * 24;
const AVISO_DIAS = 60;

const ESTILO = {
  verde: { tarjeta: "border-verde/40 bg-verde/8", barra: "bg-verde", texto: "text-verde-texto" },
  amarillo: { tarjeta: "border-amarillo/60 bg-amarillo/12", barra: "bg-amarillo", texto: "text-amarillo-texto" },
  rojo: { tarjeta: "border-semaforo-rojo/50 bg-semaforo-rojo/8", barra: "bg-semaforo-rojo", texto: "text-rojo-texto" },
};

const textoDias = (n) => (n === 1 ? "1 día" : `${n} días`);

function aMeses(dias) {
  if (dias < 45) return textoDias(dias);
  const meses = Math.round(dias / 30.4);
  return meses === 1 ? "1 mes" : `${meses} meses`;
}

export default function BarraDekra({ vehiculo, alCambio }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const estado = calcularEstadoDekra(vehiculo.placa, vehiculo.ultima_revision_tecnica);
  if (!estado) return null;

  const hoy = new Date();
  const diasParaEmpezar = Math.max(0, Math.ceil((estado.inicioVentana - hoy) / DIA));
  const yaLaPaso = !estado.dentroDeVentana && hoy >= estado.inicioVentana;

  let luz, titulo, detalle, lleno;
  if (estado.dentroDeVentana) {
    luz = "rojo";
    titulo = "¡Le toca DEKRA!";
    detalle = `Tiene hasta el final de ${estado.nombreMes}${
      estado.diasParaVencer <= 31 ? ` (quedan ${textoDias(estado.diasParaVencer)})` : ""
    }.`;
    const ventana = (estado.finVentana - estado.inicioVentana) / DIA;
    lleno = 100 - (estado.diasParaVencer / ventana) * 100;
  } else if (yaLaPaso) {
    luz = "verde";
    titulo = "DEKRA al día";
    detalle = `Ya la pasó. La próxima es en ${estado.nombreMes} del otro año.`;
    lleno = 100;
  } else {
    luz = diasParaEmpezar <= AVISO_DIAS ? "amarillo" : "verde";
    titulo = luz === "amarillo" ? "DEKRA se acerca" : "DEKRA con tiempo";
    detalle = `Le toca en ${estado.nombreMes}: faltan ${aMeses(diasParaEmpezar)}.`;
    lleno = Math.max(4, 100 - (diasParaEmpezar / 365) * 100);
  }
  const estilo = ESTILO[luz];

  const marcar = async () => {
    setGuardando(true);
    setError("");
    try {
      await marcarDekra(vehiculo.id);
      await alCambio();
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className={`rounded-tarjeta border-2 p-5 sm:p-6 ${estilo.tarjeta}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="text-3xl">
            📋
          </span>
          <div>
            <p className="etiqueta">Revisión técnica (DEKRA)</p>
            <p className={`mt-1 flex items-center gap-3 text-2xl font-bold ${estilo.texto}`}>
              <Semaforo luz={luz} grande />
              {titulo}
            </p>
            <p className="mt-1 text-lg">{detalle}</p>
          </div>
        </div>
        {estado.dentroDeVentana && (
          <Boton variante="secundario" icono={Check} onClick={marcar} disabled={guardando} className="shrink-0">
            {guardando ? "Guardando…" : "Ya pasó DEKRA"}
          </Boton>
        )}
      </div>

      <div
        role="img"
        aria-label={`${titulo}. ${detalle}`}
        className="mt-5 h-4 overflow-hidden rounded-full bg-tarjeta ring-1 ring-linea"
      >
        <div className={`barra-progreso h-full rounded-full ${estilo.barra}`} style={{ width: `${lleno}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-base text-gris">
        <span>{yaLaPaso ? "Pasada" : "Falta"}</span>
        <span className="first-letter:uppercase">{estado.nombreMes}</span>
      </div>

      {error && (
        <p role="alert" className="mt-3 font-bold text-rojo">
          {error}
        </p>
      )}
    </section>
  );
}
