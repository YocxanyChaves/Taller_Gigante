import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Car,
  Check,
  ChevronRight,
  ClipboardCheck,
  Fuel,
  Gauge,
  History,
  Pencil,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { calcularEstadoDekra } from "../../lib/dekra";
import { marcarDekra } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";
import {
  formatoColones,
  formatoDistancia,
  convertirDistancia,
  nombreCarro,
  fechaLarga,
  diasDesde,
} from "../../lib/formato";
import Placa from "../ui/Placa";
import Insignia from "../ui/Insignia";
import Boton from "../ui/Boton";
import DialogoCarro from "./DialogoCarro";
import { textoFotos } from "../../lib/etapas";

// Un carro del cliente con su historial de trabajos (el más nuevo arriba).
// Si el carro está en el taller, el botón lleva a ese trabajo; si no, a
// "Agregar un carro al sistema" con la placa ya puesta. Abajo, cuándo le toca DEKRA; si ya
// le toca, el botón "Ya pasó DEKRA" quita el aviso de Inicio.
// En el historial, debajo de la fecha de cada visita sale lo que marcaba el
// tablero y cuánto subió desde la visita anterior, para ver cómo va el carro.

export default function CarroCliente({ vehiculo, retraso = 0, alCambio }) {
  const [editando, setEditando] = useState(false);
  const activo = vehiculo.ordenes.find((o) => !["entregado", "cancelado"].includes(o.estado));
  const placa = vehiculo.placa?.toUpperCase() ?? "";
  const unidad = vehiculo.unidad_distancia ?? "km";

  return (
    <section
      style={{ "--retraso": `${retraso}ms` }}
      className="animar-entrada rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta"
    >
      <header className="flex flex-col gap-4 border-b border-linea px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-2">
          <Placa grande>{placa || "SIN PLACA"}</Placa>
          <h3 className="text-2xl font-bold">{nombreCarro(vehiculo)}</h3>
          <div className="flex flex-wrap gap-2">
            {vehiculo.tipo_motor && <Chip icono={Fuel}>Motor: {vehiculo.tipo_motor}</Chip>}
            <Chip icono={Gauge}>
              {vehiculo.kilometraje != null
                ? `Último: ${formatoDistancia(vehiculo.kilometraje, unidad)}`
                : `Marca ${unidad === "mi" ? "millas" : "kilómetros"}`}
            </Chip>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:items-stretch">
          {activo ? (
            <Boton variante="secundario" icono={Wrench} to={`/trabajos/${activo.id}`}>
              Ver el trabajo de ahora
            </Boton>
          ) : (
            <Boton variante="secundario" icono={Car} to={`/trabajos/nuevo?placa=${encodeURIComponent(placa)}`}>
              Abrir una ficha nueva
            </Boton>
          )}
          <Boton
            variante="gris"
            icono={History}
            className="justify-start"
            to={`/trabajos/nuevo?placa=${encodeURIComponent(placa)}&visita=pasada`}
          >
            Anotar una visita que ya pasó
          </Boton>
          <Boton variante="gris" icono={Pencil} className="justify-start" onClick={() => setEditando(true)}>
            Cambiar datos del carro
          </Boton>
        </div>
      </header>

      <Dekra vehiculo={vehiculo} alCambio={alCambio} />

      {vehiculo.ordenes.length === 0 ? (
        <p className="px-6 py-5 text-lg text-gris">Este carro todavía no tiene trabajos anotados.</p>
      ) : (
        <ol aria-label={`Trabajos del ${nombreCarro(vehiculo)} ${placa}`}>
          {vehiculo.ordenes.map((o, i) => (
            <li key={o.id} className="border-b border-linea last:border-b-0">
              <FilaHistorial orden={o} anterior={visitaAnteriorConLectura(vehiculo.ordenes, i)} />
            </li>
          ))}
        </ol>
      )}

      {editando && (
        <DialogoCarro
          vehiculo={vehiculo}
          alCerrar={() => setEditando(false)}
          alGuardado={async () => {
            await alCambio();
            setEditando(false);
          }}
        />
      )}
    </section>
  );
}

// Pastillita gris con un ícono: el motor, la última lectura.
function Chip({ icono: Icono, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-suave px-3 py-1 text-base text-gris">
      <Icono aria-hidden="true" size={16} />
      {children}
    </span>
  );
}

// La visita anterior a la i-ésima (las órdenes vienen de la más nueva a la más
// vieja) que tenga lectura del tablero, para comparar. null si no hay.
function visitaAnteriorConLectura(ordenes, i) {
  if (ordenes[i].km_entrada == null) return null;
  return ordenes.slice(i + 1).find((o) => o.km_entrada != null && o.estado !== "cancelado") ?? null;
}

// "en 12 días", "en 4 meses", "en 2,5 años"; "el mismo día".
function textoTiempo(desde, hasta) {
  const dias = Math.max(0, diasDesde(desde) - diasDesde(hasta));
  if (dias === 0) return "el mismo día";
  if (dias < 45) return dias === 1 ? "en 1 día" : `en ${dias} días`;
  const meses = Math.round(dias / 30.4);
  if (meses < 18) return `en ${meses} meses`;
  return `en ${(dias / 365).toLocaleString("es-CR", { maximumFractionDigits: 1 })} años`;
}

// Debajo de la fecha: lo que marcaba el tablero y, en una pastilla verde,
// cuánto subió desde la visita anterior. Si marca menos (puede ser un error
// al anotarlo), se avisa en amarillo.
function Lectura({ orden, anterior }) {
  if (orden.km_entrada == null) return null;
  const unidad = orden.unidad_distancia ?? "km";
  const nombre = unidad === "mi" ? "millas" : "km";
  const diferencia = anterior
    ? orden.km_entrada - convertirDistancia(anterior.km_entrada, anterior.unidad_distancia ?? "km", unidad)
    : null;

  return (
    <span className="flex flex-col items-start gap-1">
      <span className="numeros flex items-center gap-1.5 text-base font-bold text-tinta">
        <Gauge aria-hidden="true" size={16} className="text-gris" />
        {formatoDistancia(orden.km_entrada, unidad)}
      </span>
      {diferencia > 0 && (
        <span className="numeros inline-flex items-center gap-1.5 rounded-full bg-verde/10 px-2.5 py-0.5 text-sm font-bold text-verde-texto">
          <TrendingUp aria-hidden="true" size={15} strokeWidth={2.6} />
          Subió {diferencia.toLocaleString("es-CR")} {nombre} {textoTiempo(anterior.fecha_ingreso, orden.fecha_ingreso)}
        </span>
      )}
      {diferencia === 0 && <span className="text-sm text-gris">Igual que la visita anterior</span>}
      {diferencia < 0 && (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amarillo/15 px-2.5 py-0.5 text-sm font-bold text-amarillo-texto">
          <TrendingDown aria-hidden="true" size={15} strokeWidth={2.6} />
          Marca menos que la vez anterior
        </span>
      )}
    </span>
  );
}

function Dekra({ vehiculo, alCambio }) {
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const estado = calcularEstadoDekra(vehiculo.placa, vehiculo.ultima_revision_tecnica);
  if (!estado) return null;

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
    <div
      className={`flex flex-col gap-3 border-b border-linea px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${estado.dentroDeVentana ? "bg-rojo/5" : ""}`}
    >
      <p className="flex items-center gap-3 text-lg">
        <ClipboardCheck aria-hidden="true" size={22} className={estado.dentroDeVentana ? "text-rojo" : "text-gris"} />
        {estado.dentroDeVentana ? (
          <span>
            <strong>Le toca DEKRA</strong>: tiene hasta el final de {estado.nombreMes}
            {estado.diasParaVencer <= 31 && ` (${estado.diasParaVencer === 1 ? "1 día" : `${estado.diasParaVencer} días`})`}.
          </span>
        ) : (
          <span className="text-gris">DEKRA: le toca en {estado.nombreMes}.</span>
        )}
      </p>
      {estado.dentroDeVentana && (
        <Boton variante="secundario" icono={Check} onClick={marcar} disabled={guardando}>
          {guardando ? "Guardando…" : "Ya pasó DEKRA"}
        </Boton>
      )}
      {error && <p role="alert" className="font-bold text-rojo">{error}</p>}
    </div>
  );
}

function FilaHistorial({ orden, anterior }) {
  const fecha = orden.estado === "cita" && orden.fecha_cita ? orden.fecha_cita : orden.fecha_ingreso;
  const debe = orden.estado === "entregado" && orden.saldo > 0;

  return (
    <Link
      to={`/trabajos/${orden.id}`}
      className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-6 py-4 transition-colors duration-200 hover:bg-fondo md:grid-cols-[15rem_minmax(0,1fr)_12rem_auto]"
    >
      <span className="flex flex-col gap-1.5">
        <span className="text-base text-gris first-letter:uppercase md:text-lg">{fechaLarga(fecha)}</span>
        <Lectura orden={orden} anterior={anterior} />
      </span>
      <ChevronRight
        aria-hidden="true"
        size={22}
        className="col-start-2 row-start-1 text-gris transition-transform duration-200 group-hover:translate-x-1 md:col-start-4"
      />
      <span className="col-span-2 min-w-0 md:col-span-1 md:col-start-2 md:row-start-1">
        <span className="block truncate text-lg font-bold">{orden.diagnostico || orden.problema_reportado}</span>
        <span className="flex flex-wrap items-center gap-3">
          <Insignia estado={orden.estado} />
          {orden.fotos.length > 0 && (
            <span className="flex items-center gap-1.5 text-base text-gris">
              <Camera aria-hidden="true" size={18} />
              {textoFotos(orden.fotos)}
            </span>
          )}
        </span>
      </span>
      <span className="col-span-2 flex flex-col md:col-span-1 md:col-start-3 md:row-start-1 md:items-end">
        {orden.total > 0 && <span className="numeros text-lg">{formatoColones(orden.total)}</span>}
        {debe && <span className="numeros text-base font-bold text-rojo">Debe {formatoColones(orden.saldo)}</span>}
      </span>
    </Link>
  );
}
