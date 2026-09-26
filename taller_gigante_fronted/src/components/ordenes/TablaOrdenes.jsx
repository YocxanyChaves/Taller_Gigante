import { ClipboardList, Pencil, Trash2, Loader2 } from "lucide-react";
import { formatoColones } from "../../lib/formato";

const estadoStyles = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

const colonesO = (valor) => (valor != null ? formatoColones(valor) : "—");

export function TablaOrdenes({ ordenes, loading, onEditar, onEliminar }) {
  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando órdenes...
        </div>
      ) : ordenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Todavía no hay órdenes registradas.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/80 text-muted-foreground">
              <tr>
                <th className="text-left p-4">Orden</th>
                <th className="text-left p-4">Vehículo</th>
                <th className="text-left p-4">Cliente</th>
                <th className="text-left p-4">Estado</th>
                <th className="text-left p-4">Costo est. / final</th>
                <th className="text-left p-4">Entrega</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  className="border-t border-foreground/10 hover:bg-card/40 transition"
                >
                  <td className="p-4 font-semibold text-foreground">#TG-{orden.id}</td>
                  <td className="p-4 text-muted-foreground">
                    {orden.vehiculos
                      ? `${orden.vehiculos.placa} · ${[orden.vehiculos.marca, orden.vehiculos.modelo]
                          .filter(Boolean)
                          .join(" ")}`
                      : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {orden.vehiculos?.clientes?.nombre || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        estadoStyles[orden.estado] || "bg-foreground/5 text-muted-foreground"
                      }`}
                    >
                      {orden.estado}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {colonesO(orden.costo_estimado)} / {colonesO(orden.costo_final)}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {orden.fecha_entrega
                      ? new Date(orden.fecha_entrega).toLocaleDateString("es-CR")
                      : "—"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditar(orden)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </button>

                      <button
                        onClick={() => onEliminar(orden)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-red-500/20 hover:border-red-500/30 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-accent" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
