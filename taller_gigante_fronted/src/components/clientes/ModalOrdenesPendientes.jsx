import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import { marcarOrdenCompletada } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";

// Antes de eliminar un cliente: sus órdenes activas deben cerrarse primero.
// Cuando ya no queda ninguna, llama a `onTodasCompletadas`.
export function ModalOrdenesPendientes({ cliente, ordenes, onClose, onTodasCompletadas }) {
  const [pendientes, setPendientes] = useState(ordenes);
  const [actualizandoId, setActualizandoId] = useState(null);
  const [error, setError] = useState("");

  const handleMarcar = async (ordenId) => {
    setActualizandoId(ordenId);
    setError("");

    const { error: updateError } = await marcarOrdenCompletada(ordenId);

    setActualizandoId(null);

    if (updateError) {
      setError(mensajeError(updateError));
      return;
    }

    const restantes = pendientes.filter((o) => o.id !== ordenId);
    setPendientes(restantes);
    if (restantes.length === 0) onTodasCompletadas();
  };

  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[85vh] flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-11 w-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-lg font-bold">No se puede eliminar todavía</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-5">
        <span className="font-semibold text-foreground/80">{cliente.nombre}</span>{" "}
        tiene {pendientes.length} orden(es) pendiente(s) o en proceso. Márcalas
        como completadas para poder continuar con la eliminación.
      </p>

      <ErrorEnModal mensaje={error} />

      <div className="overflow-y-auto space-y-2 pr-1">
        {pendientes.map((orden) => (
          <div
            key={orden.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                #TG-{orden.id}
                {orden.vehiculos
                  ? ` · ${orden.vehiculos.placa} ${[orden.vehiculos.marca, orden.vehiculos.modelo]
                      .filter(Boolean)
                      .join(" ")}`
                  : ""}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {orden.descripcion || "Sin descripción"} ·{" "}
                <span className={orden.estado === "Pendiente" ? "text-accent" : "text-primary"}>
                  {orden.estado}
                </span>
              </p>
            </div>
            <button
              onClick={() => handleMarcar(orden.id)}
              disabled={actualizandoId === orden.id}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-2 text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              {actualizandoId === orden.id ? "Guardando..." : "Marcar completada"}
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-5 w-full py-3 border border-foreground/10 rounded-xl font-semibold text-foreground hover:bg-foreground/5 transition"
      >
        Cerrar
      </button>
    </Modal>
  );
}
