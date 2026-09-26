import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { Users, Plus, Inbox } from "lucide-react";
import { TablaClientes } from "../components/clientes/TablaClientes";
import { ModalCliente } from "../components/clientes/ModalCliente";
import { ModalVincularCuenta } from "../components/clientes/ModalVincularCuenta";
import { ModalSolicitudes } from "../components/clientes/ModalSolicitudes";
import { ModalOrdenesPendientes } from "../components/clientes/ModalOrdenesPendientes";
import { ModalEliminarCliente } from "../components/clientes/ModalEliminarCliente";
import {
  listarClientes,
  listarSolicitudesPendientes,
  cambiarBloqueo,
  idsVehiculosDeCliente,
  ordenesActivasDeVehiculos,
  eliminarClienteCompleto,
} from "../services/clientes";
import { mensajeError } from "../lib/errores";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [bloqueandoId, setBloqueandoId] = useState(null);

  // Ventanas abiertas (null = cerrada).
  const [edicion, setEdicion] = useState(null); // { cliente }; cliente null = nuevo
  const [vincularA, setVincularA] = useState(null); // cliente
  const [solicitudesAbiertas, setSolicitudesAbiertas] = useState(false);
  const [ordenesPendientes, setOrdenesPendientes] = useState(null); // { cliente, ordenes, cantidadVehiculos }
  const [eliminacion, setEliminacion] = useState(null); // { cliente, cantidadVehiculos }

  const recargarClientes = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await listarClientes();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClientes(data);
    }

    setLoading(false);
  };

  const recargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    const { data, error: fetchError } = await listarSolicitudesPendientes();
    if (!fetchError) setSolicitudes(data || []);
    setLoadingSolicitudes(false);
  };

  useEffect(() => {
    recargarClientes();
    recargarSolicitudes();
  }, []);

  const recargarTodo = () => {
    recargarClientes();
    recargarSolicitudes();
  };

  const abrirSolicitudes = () => {
    setSolicitudesAbiertas(true);
    recargarSolicitudes();
  };

  const handleToggleBloqueo = async (cliente) => {
    const nuevoEstado = !cliente.bloqueado;
    const confirmado = window.confirm(
      nuevoEstado
        ? `¿Bloquear a ${cliente.nombre}? Ya no verá su información en el portal, solo un aviso de perfil en revisión.`
        : `¿Desbloquear a ${cliente.nombre}? Volverá a ver su información normalmente.`
    );
    if (!confirmado) return;

    setBloqueandoId(cliente.id);
    const { error: bloqueoError } = await cambiarBloqueo(cliente.id, nuevoEstado);
    setBloqueandoId(null);

    if (bloqueoError) {
      setError(mensajeError(bloqueoError));
      return;
    }

    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, bloqueado: nuevoEstado } : c))
    );
  };

  // Sin vehículos: se confirma y se borra. Con órdenes activas: primero hay
  // que cerrarlas. Si no: se elige entre conservar el historial o borrar todo.
  const iniciarEliminacion = async (cliente) => {
    setError("");
    const vehiculoIds = await idsVehiculosDeCliente(cliente.id);

    if (vehiculoIds.length === 0) {
      const confirmado = window.confirm(
        `¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`
      );
      if (!confirmado) return;

      const { error: rpcError } = await eliminarClienteCompleto(cliente.id, "todo");
      if (rpcError) {
        setError(mensajeError(rpcError));
      } else {
        recargarClientes();
      }
      return;
    }

    const ordenes = await ordenesActivasDeVehiculos(vehiculoIds);
    if (ordenes.length > 0) {
      setOrdenesPendientes({ cliente, ordenes, cantidadVehiculos: vehiculoIds.length });
      return;
    }

    setEliminacion({ cliente, cantidadVehiculos: vehiculoIds.length });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <Users className="h-6 w-6 text-primary" />
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Clientes registrados en el taller
            </p>
          </div>

          <div className="flex items-center gap-3">
            {solicitudes.length > 0 && (
              <button
                onClick={abrirSolicitudes}
                className="flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-primary px-4 py-3 text-sm font-semibold hover:bg-blue-500/20 transition"
              >
                <Inbox className="h-4 w-4" />
                Solicitudes pendientes ({solicitudes.length})
              </button>
            )}

            <button
              onClick={() => setEdicion({ cliente: null })}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-blue-700 transition-all"
            >
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <TablaClientes
          clientes={clientes}
          loading={loading}
          bloqueandoId={bloqueandoId}
          onEditar={(cliente) => setEdicion({ cliente })}
          onVincular={setVincularA}
          onToggleBloqueo={handleToggleBloqueo}
          onEliminar={iniciarEliminacion}
        />
      </div>

      {edicion && (
        <ModalCliente
          cliente={edicion.cliente}
          onClose={() => setEdicion(null)}
          onGuardado={() => {
            setEdicion(null);
            recargarClientes();
          }}
        />
      )}

      {vincularA && (
        <ModalVincularCuenta
          cliente={vincularA}
          clientes={clientes}
          onClose={() => setVincularA(null)}
          onVinculado={() => {
            setVincularA(null);
            recargarTodo();
          }}
        />
      )}

      {solicitudesAbiertas && (
        <ModalSolicitudes
          solicitudes={solicitudes}
          cargando={loadingSolicitudes}
          onClose={() => setSolicitudesAbiertas(false)}
          onCambio={recargarTodo}
        />
      )}

      {ordenesPendientes && (
        <ModalOrdenesPendientes
          cliente={ordenesPendientes.cliente}
          ordenes={ordenesPendientes.ordenes}
          onClose={() => setOrdenesPendientes(null)}
          onTodasCompletadas={() => {
            const { cliente, cantidadVehiculos } = ordenesPendientes;
            setOrdenesPendientes(null);
            setEliminacion({ cliente, cantidadVehiculos });
          }}
        />
      )}

      {eliminacion && (
        <ModalEliminarCliente
          cliente={eliminacion.cliente}
          cantidadVehiculos={eliminacion.cantidadVehiculos}
          onClose={() => setEliminacion(null)}
          onEliminado={() => {
            setEliminacion(null);
            recargarClientes();
          }}
        />
      )}
    </Layout>
  );
}
