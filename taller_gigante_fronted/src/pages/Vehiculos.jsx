import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Car, Plus } from "lucide-react";
import { TablaVehiculos } from "../components/vehiculos/TablaVehiculos";
import { ModalVehiculo } from "../components/vehiculos/ModalVehiculo";
import {
  listarVehiculos,
  listarClientesParaSelector,
  eliminarVehiculo,
} from "../services/vehiculos";
import { mensajeError } from "../lib/errores";

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [edicion, setEdicion] = useState(null); // { vehiculo }; vehiculo null = nuevo

  const aplicarVehiculos = ({ data, error: fetchError }) => {
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setError("");
      setVehiculos(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    listarVehiculos().then(aplicarVehiculos);
    listarClientesParaSelector().then(({ data, error: fetchError }) => {
      if (!fetchError) setClientes(data);
    });
  }, []);

  const handleDelete = async (vehiculo) => {
    const confirmado = window.confirm(
      `¿Eliminar el vehículo con placa ${vehiculo.placa}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const { error: deleteError } = await eliminarVehiculo(vehiculo.id);

    if (deleteError) {
      setError(mensajeError(deleteError));
    } else {
      setVehiculos((prev) => prev.filter((v) => v.id !== vehiculo.id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <Car className="h-6 w-6 text-primary" />
              Vehículos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vehículos registrados en el taller
            </p>
          </div>

          <button
            onClick={() => setEdicion({ vehiculo: null })}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo vehículo
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <TablaVehiculos
          vehiculos={vehiculos}
          loading={loading}
          onEditar={(vehiculo) => setEdicion({ vehiculo })}
          onEliminar={handleDelete}
        />
      </div>

      {edicion && (
        <ModalVehiculo
          vehiculo={edicion.vehiculo}
          clientes={clientes}
          onClose={() => setEdicion(null)}
          onGuardado={() => {
            setEdicion(null);
            listarVehiculos().then(aplicarVehiculos);
          }}
        />
      )}
    </Layout>
  );
}
