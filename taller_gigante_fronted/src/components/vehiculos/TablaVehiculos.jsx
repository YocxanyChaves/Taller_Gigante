import { Car, Pencil, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { calcularEstadoDekra } from "../../lib/dekra";
import { formatoKm } from "../../lib/formato";

export function TablaVehiculos({ vehiculos, loading, onEditar, onEliminar }) {
  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando vehículos...
        </div>
      ) : vehiculos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Car className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Todavía no hay vehículos registrados.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/80 text-muted-foreground">
              <tr>
                <th className="text-left p-4">Placa</th>
                <th className="text-left p-4">Marca / Modelo</th>
                <th className="text-left p-4">Año</th>
                <th className="text-left p-4">Color</th>
                <th className="text-left p-4">Kilometraje</th>
                <th className="text-left p-4">Cliente</th>
                <th className="text-left p-4">DEKRA</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {vehiculos.map((vehiculo) => (
                <tr
                  key={vehiculo.id}
                  className="border-t border-foreground/10 hover:bg-card/40 transition"
                >
                  <td className="p-4 font-semibold text-foreground">{vehiculo.placa}</td>
                  <td className="p-4 text-muted-foreground">
                    {[vehiculo.marca, vehiculo.modelo].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">{vehiculo.año || "—"}</td>
                  <td className="p-4 text-muted-foreground">{vehiculo.color || "—"}</td>
                  <td className="p-4 text-muted-foreground">
                    {vehiculo.kilometraje != null ? formatoKm(vehiculo.kilometraje) : "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {vehiculo.clientes?.nombre || "—"}
                  </td>
                  <td className="p-4">
                    <EstadoDekra vehiculo={vehiculo} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditar(vehiculo)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </button>

                      <button
                        onClick={() => onEliminar(vehiculo)}
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

// Mes de revisión técnica según la placa; en rojo si ya está en su ventana.
function EstadoDekra({ vehiculo }) {
  const estado = calcularEstadoDekra(vehiculo.placa, vehiculo.ultima_revision_tecnica);
  if (!estado) return <span className="text-muted-foreground">—</span>;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
        estado.dentroDeVentana
          ? "bg-red-500/15 text-accent"
          : "bg-foreground/5 text-muted-foreground"
      }`}
      title={estado.dentroDeVentana ? `Vence en ${estado.diasParaVencer} día(s)` : ""}
    >
      {estado.dentroDeVentana && <AlertTriangle className="h-3 w-3" />}
      {estado.nombreMes}
    </span>
  );
}
