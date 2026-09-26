import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import { eliminarClienteCompleto } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";

// Eliminar un cliente que tiene vehículos: conservar su historial o borrar todo.
export function ModalEliminarCliente({ cliente, cantidadVehiculos, onClose, onEliminado }) {
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

  const eliminar = async (modo) => {
    setEliminando(true);
    setError("");

    const { error: rpcError } = await eliminarClienteCompleto(cliente.id, modo);

    setEliminando(false);

    if (rpcError) {
      setError(mensajeError(rpcError));
      return;
    }

    onEliminado();
  };

  return (
    <Modal onClose={onClose} closeDisabled={eliminando} className="max-w-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-2xl bg-yellow-500/15 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h2 className="text-lg font-bold">Eliminar cliente</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        <span className="font-semibold text-foreground/80">{cliente.nombre}</span>{" "}
        tiene {cantidadVehiculos} vehículo(s) con historial ya completado. ¿Qué
        deseas hacer?
      </p>

      <ErrorEnModal mensaje={error} />

      <div className="space-y-3">
        <button
          onClick={() => eliminar("conservar_historial")}
          disabled={eliminando}
          className="w-full text-left rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 hover:bg-blue-500/20 transition disabled:opacity-60"
        >
          <p className="text-sm font-semibold text-primary">Conservar historial</p>
          <p className="text-xs text-muted-foreground mt-1">
            Se elimina solo la ficha del cliente. Sus vehículos quedan sin dueño,
            pero su historial de órdenes se mantiene para las estadísticas del
            taller.
          </p>
        </button>

        <button
          onClick={() => eliminar("todo")}
          disabled={eliminando}
          className="w-full text-left rounded-2xl border border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/20 transition disabled:opacity-60"
        >
          <p className="text-sm font-semibold text-accent">Eliminar todo</p>
          <p className="text-xs text-muted-foreground mt-1">
            Se elimina el cliente, sus vehículos y todo su historial de órdenes.
            No se puede deshacer.
          </p>
        </button>

        <button
          onClick={onClose}
          disabled={eliminando}
          className="w-full py-3 border border-foreground/10 rounded-xl font-semibold text-foreground hover:bg-foreground/5 transition disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>

      {eliminando && (
        <p className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Eliminando...
        </p>
      )}
    </Modal>
  );
}
