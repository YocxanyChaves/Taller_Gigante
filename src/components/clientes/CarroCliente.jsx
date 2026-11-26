import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  Car,
  ArrowRight,
  Fuel,
  Gauge,
  History,
  Pencil,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";
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
import BarraDekra from "./BarraDekra";
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
      className="animar-entrada rounded-tarjeta border-2 border-linea bg-tarjeta shadow-tarjeta"
    >
      <header className="flex flex-col gap-6 border-b border-linea p-6 sm:p-8">
        <div className="flex flex-col items-start gap-3">
          <Placa grande roja>
            {placa || "SIN PLACA"}
          </Placa>
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
        <div className="grid gap-3 md:grid-cols-3">
          {activo ? (
            <Boton variante="secundario" icono={Wrench} anchoCompleto to={`/trabajos/${activo.id}`}>
              Ver el trabajo de ahora
            </Boton>
          ) : (
            <Boton
              variante="secundario"
              icono={Car}
              anchoCompleto
              to={`/trabajos/nuevo?placa=${encodeURIComponent(placa)}`}
            >
              Abrir una ficha nueva
            </Boton>
          )}
          <Boton
            variante="secundario"
            icono={History}
            anchoCompleto
            to={`/trabajos/nuevo?placa=${encodeURIComponent(placa)}&visita=pasada`}
          >
            Anotar una visita que ya pasó
          </Boton>
          <Boton variante="secundario" icono={Pencil} anchoCompleto onClick={() => setEditando(true)}>
            Cambiar datos del carro
          </Boton>
        </div>
      </header>

      <div className="flex flex-col gap-8 p-6 sm:p-8">
        <BarraDekra vehiculo={vehiculo} alCambio={alCambio} />

        <section className="flex flex-col gap-4">
          <h4 className="text-xl font-bold">🗂️ Visitas al taller</h4>
          {vehiculo.ordenes.length === 0 ? (
            <p className="text-lg text-gris">Este carro todavía no tiene trabajos anotados.</p>
          ) : (
            <ol aria-label={`Trabajos del ${nombreCarro(vehiculo)} ${placa}`} className="flex flex-col gap-4">
              {vehiculo.ordenes.map((o, i) => (
                <li key={o.id}>
                  <FilaHistorial orden={o} anterior={visitaAnteriorConLectura(vehiculo.ordenes, i)} />
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

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

function FilaHistorial({ orden, anterior }) {
  const fecha = orden.estado === "cita" && orden.fecha_cita ? orden.fecha_cita : orden.fecha_ingreso;
  const debe = orden.estado === "entregado" && orden.saldo > 0;

  return (
    <Link
      to={`/trabajos/${orden.id}`}
      className="tarjeta-carro group grid grid-cols-1 items-center gap-x-6 gap-y-4 rounded-tarjeta border-2 border-l-[10px] border-linea border-l-rojo bg-tarjeta p-5 hover:border-rojo hover:bg-rojo/[0.03] sm:p-6 md:grid-cols-[15rem_minmax(0,1fr)_12rem_auto]"
    >
      <span className="flex flex-col gap-1.5">
        <span className="text-base text-gris first-letter:uppercase md:text-lg">{fechaLarga(fecha)}</span>
        <Lectura orden={orden} anterior={anterior} />
      </span>
      <span className="min-w-0 md:col-start-2 md:row-start-1">
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
      <span className="flex flex-col md:col-start-3 md:row-start-1 md:items-end">
        {orden.total > 0 && <span className="numeros text-lg">{formatoColones(orden.total)}</span>}
        {debe && <span className="numeros text-base font-bold text-rojo">Debe {formatoColones(orden.saldo)}</span>}
      </span>
      <span className="flex min-h-12 items-center justify-center gap-2 rounded-control border-2 border-rojo bg-rojo px-4 text-lg font-bold text-white transition-colors duration-200 group-hover:border-tinta group-hover:bg-tinta group-hover:text-rojo md:col-start-4 md:row-start-1">
        Ver
        <ArrowRight aria-hidden="true" size={20} className="transition-transform duration-200 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
