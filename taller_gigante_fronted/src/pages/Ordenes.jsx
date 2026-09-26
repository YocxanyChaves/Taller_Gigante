import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { ClipboardList, Plus } from "lucide-react";
import { TablaOrdenes } from "../components/ordenes/TablaOrdenes";
import { ModalOrden } from "../components/ordenes/ModalOrden";
import {
  listarOrdenes,
  listarVehiculosParaSelector,
  eliminarOrden,
} from "../services/ordenes";
import { mensajeError } from "../lib/errores";

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edicion, setEdicion] = useState(null); // { orden }; orden null = nueva

  const aplicarOrdenes = ({ data, error: fetchError }) => {
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError("");
      setOrdenes(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    listarOrdenes().then(aplicarOrdenes);
    listarVehiculosParaSelector().then(({ data, error: fetchError }) => {
      if (!fetchError) setVehiculos(data);
    });
  }, []);

  const handleDelete = async (orden) => {
    const confirmado = window.confirm(
      `¿Eliminar la orden #${orden.id}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const { error: deleteError } = await eliminarOrden(orden.id);

    if (deleteError) {
      setError(mensajeError(deleteError));
    } else {
      setOrdenes((prev) => prev.filter((o) => o.id !== orden.id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <ClipboardList className="h-6 w-6 text-accent" />
              Órdenes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Órdenes de trabajo del taller
            </p>
          </div>

          <button
            onClick={() => setEdicion({ orden: null })}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nueva orden
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <TablaOrdenes
          ordenes={ordenes}
          loading={loading}
          onEditar={(orden) => setEdicion({ orden })}
          onEliminar={handleDelete}
        />
      </div>

      {edicion && (
        <ModalOrden
          orden={edicion.orden}
          vehiculos={vehiculos}
          onClose={() => setEdicion(null)}
          onGuardado={() => {
            setEdicion(null);
            listarOrdenes().then(aplicarOrdenes);
          }}
        />
      )}
    </Layout>
  );
}
