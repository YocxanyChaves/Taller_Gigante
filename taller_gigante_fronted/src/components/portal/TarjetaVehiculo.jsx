import {
  Car,
  ClipboardList,
  Clock,
  CheckCircle2,
  Wrench,
  Stethoscope,
  Banknote,
  CalendarClock,
} from "lucide-react";
import { formatoColones } from "../../lib/formato";

const estadoBadge = {
  Completado:
    "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30",
  Pendiente: "bg-red-500/15 text-accent border-red-500/30",
};

const estadoIcon = {
  Completado: CheckCircle2,
  "En proceso": Wrench,
  Pendiente: Clock,
};

// Un vehículo del cliente con sus órdenes de trabajo.
export function TarjetaVehiculo({ vehiculo }) {
  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-11 w-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
          <Car className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground">
            {vehiculo.marca} {vehiculo.modelo} {vehiculo.año ? `(${vehiculo.año})` : ""}
          </p>
          <p className="text-sm text-muted-foreground">
            Placa {vehiculo.placa} {vehiculo.color ? `· ${vehiculo.color}` : ""}
          </p>
        </div>
      </div>

      {(vehiculo.ordenes || []).length === 0 ? (
        <p className="text-sm text-muted-foreground/70 flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          Sin órdenes de trabajo registradas.
        </p>
      ) : (
        <div className="space-y-4">
          {vehiculo.ordenes.map((orden) => (
            <TarjetaOrden key={orden.id} orden={orden} />
          ))}
        </div>
      )}
    </div>
  );
}

function TarjetaOrden({ orden }) {
  const EstadoIcon = estadoIcon[orden.estado] || ClipboardList;

  return (
    <div className="rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/[0.04] to-transparent p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center shrink-0">
            <ClipboardList className="h-4 w-4 text-accent" />
          </div>
          <p className="font-bold text-foreground">Orden #TG-{orden.id}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
            estadoBadge[orden.estado] ||
            "bg-foreground/5 text-muted-foreground border-foreground/10"
          }`}
        >
          <EstadoIcon className="h-3.5 w-3.5" />
          {orden.estado}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {orden.descripcion && (
          <div className="flex items-start gap-3 rounded-xl bg-foreground/5 p-3.5 sm:col-span-2">
            <ClipboardList className="h-4 w-4 text-accent shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Descripción
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {orden.descripcion}
              </p>
            </div>
          </div>
        )}

        {orden.diagnostico && (
          <div className="flex items-start gap-3 rounded-xl bg-foreground/5 p-3.5 sm:col-span-2">
            <Stethoscope className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Diagnóstico
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {orden.diagnostico}
              </p>
            </div>
          </div>
        )}

        {(orden.costo_estimado != null || orden.costo_final != null) && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5">
            <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-300 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {orden.costo_final != null ? "Costo final" : "Costo estimado"}
              </p>
              <p className="text-sm font-bold text-foreground mt-0.5">
                {formatoColones(orden.costo_final ?? orden.costo_estimado)}
              </p>
            </div>
          </div>
        )}

        {(orden.fecha_ingreso || orden.fecha_entrega) && (
          <div className="flex items-center gap-3 rounded-xl bg-foreground/5 p-3.5">
            <CalendarClock className="h-4 w-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Fechas
              </p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {orden.fecha_ingreso &&
                  `Ingreso ${new Date(orden.fecha_ingreso).toLocaleDateString("es-CR")}`}
                {orden.fecha_ingreso && orden.fecha_entrega && " · "}
                {orden.fecha_entrega &&
                  `Entrega ${new Date(orden.fecha_entrega).toLocaleDateString("es-CR")}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
