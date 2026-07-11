import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Loader2,
  Link2,
  Search,
  UserCheck,
  Inbox,
  ArrowLeft,
  Check,
  XCircle,
  Lock,
  ShieldOff,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const emptyForm = { nombre: "", telefono: "", correo: "", direccion: "" };

const soloDigitos = (s) => (s || "").replace(/\D/g, "");

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkTarget, setLinkTarget] = useState(null);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [vinculando, setVinculando] = useState(false);

  const [solicitudes, setSolicitudes] = useState([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [solicitudesModalOpen, setSolicitudesModalOpen] = useState(false);
  const [solicitudEnRevision, setSolicitudEnRevision] = useState(null);
  const [clientesDisponibles, setClientesDisponibles] = useState([]);
  const [loadingClientesDisponibles, setLoadingClientesDisponibles] = useState(false);
  const [busquedaClienteDisponible, setBusquedaClienteDisponible] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [clienteYaVinculado, setClienteYaVinculado] = useState(null);

  const [confirmarEliminarOpen, setConfirmarEliminarOpen] = useState(false);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [infoEliminar, setInfoEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [bloqueandoId, setBloqueandoId] = useState(null);

  const [ordenesPendientesOpen, setOrdenesPendientesOpen] = useState(false);
  const [clientePendienteOrdenes, setClientePendienteOrdenes] = useState(null);
  const [vehiculoIdsPendientes, setVehiculoIdsPendientes] = useState([]);
  const [ordenesPendientesList, setOrdenesPendientesList] = useState([]);
  const [actualizandoOrdenId, setActualizandoOrdenId] = useState(null);

  const fetchClientes = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("clientes")
      .select("*")
      .order("fecha_ingreso", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setClientes(data);
    }

    setLoading(false);
  };

  const fetchSolicitudes = async () => {
    setLoadingSolicitudes(true);

    const { data, error: fetchError } = await supabase
      .from("solicitudes_vinculacion")
      .select("*, usuarios(nombre, correo)")
      .eq("estado", "pendiente")
      .order("fecha_solicitud", { ascending: true });

    if (!fetchError) setSolicitudes(data || []);
    setLoadingSolicitudes(false);
  };

  useEffect(() => {
    fetchClientes();
    fetchSolicitudes();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (cliente) => {
    setEditingId(cliente.id);
    setForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: submitError } = editingId
      ? await supabase.from("clientes").update(form).eq("id", editingId)
      : await supabase.from("clientes").insert(form);

    setSaving(false);

    if (submitError) {
      setError(submitError.message);
      return;
    }

    closeModal();
    fetchClientes();
  };

  const iniciarEliminacion = async (cliente) => {
    setError("");

    const { data: vehiculosCliente } = await supabase
      .from("vehiculos")
      .select("id")
      .eq("id_cliente", cliente.id);

    const vehiculoIds = (vehiculosCliente || []).map((v) => v.id);

    if (vehiculoIds.length === 0) {
      const confirmado = window.confirm(
        `¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`
      );
      if (!confirmado) return;
      await ejecutarEliminacion(cliente, "todo");
      return;
    }

    await revisarOrdenesYContinuar(cliente, vehiculoIds);
  };

  const revisarOrdenesYContinuar = async (cliente, vehiculoIds) => {
    const { data: ordenesActivas } = await supabase
      .from("ordenes")
      .select(
        "id, estado, descripcion, id_vehiculo, vehiculos(placa, marca, modelo)"
      )
      .in("id_vehiculo", vehiculoIds)
      .in("estado", ["Pendiente", "En proceso"])
      .order("id");

    if ((ordenesActivas || []).length > 0) {
      setClientePendienteOrdenes(cliente);
      setVehiculoIdsPendientes(vehiculoIds);
      setOrdenesPendientesList(ordenesActivas);
      setOrdenesPendientesOpen(true);
      return;
    }

    setClienteAEliminar(cliente);
    setInfoEliminar({ vehiculos: vehiculoIds.length });
    setConfirmarEliminarOpen(true);
  };

  const cerrarOrdenesPendientes = () => {
    setOrdenesPendientesOpen(false);
    setClientePendienteOrdenes(null);
    setVehiculoIdsPendientes([]);
    setOrdenesPendientesList([]);
  };

  const marcarOrdenCompletada = async (ordenId) => {
    setActualizandoOrdenId(ordenId);

    const { error: updateError } = await supabase
      .from("ordenes")
      .update({ estado: "Completado" })
      .eq("id", ordenId);

    setActualizandoOrdenId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const restantes = ordenesPendientesList.filter((o) => o.id !== ordenId);
    setOrdenesPendientesList(restantes);

    if (restantes.length === 0) {
      const cliente = clientePendienteOrdenes;
      const vehiculoIds = vehiculoIdsPendientes;
      cerrarOrdenesPendientes();
      setClienteAEliminar(cliente);
      setInfoEliminar({ vehiculos: vehiculoIds.length });
      setConfirmarEliminarOpen(true);
    }
  };

  const cerrarConfirmarEliminar = () => {
    setConfirmarEliminarOpen(false);
    setClienteAEliminar(null);
    setInfoEliminar(null);
  };

  const ejecutarEliminacion = async (cliente, modo) => {
    setEliminando(true);

    const { error: rpcError } = await supabase.rpc(
      "eliminar_cliente_completo",
      {
        p_cliente_id: cliente.id,
        p_modo: modo,
      }
    );

    setEliminando(false);

    if (rpcError) {
      setError(rpcError.message);
      return;
    }

    cerrarConfirmarEliminar();
    fetchClientes();
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

    const { error: bloqueoError } = await supabase
      .from("clientes")
      .update({ bloqueado: nuevoEstado })
      .eq("id", cliente.id);

    setBloqueandoId(null);

    if (bloqueoError) {
      setError(bloqueoError.message);
      return;
    }

    setClientes((prev) =>
      prev.map((c) =>
        c.id === cliente.id ? { ...c, bloqueado: nuevoEstado } : c
      )
    );
  };

  const openLinkModal = async (cliente) => {
    setLinkTarget(cliente);
    setLinkModalOpen(true);
    setBusquedaUsuario("");
    setLoadingUsuarios(true);

    // Se muestran TODAS las cuentas que se registraron (rol cliente), estén
    // o no ya vinculadas a otra ficha. Si el admin elige una que ya tiene
    // ficha propia, se fusiona esa ficha con la que está eligiendo ahora.
    const { data } = await supabase
      .from("usuarios")
      .select("id, nombre, correo")
      .eq("rol", "cliente")
      .order("nombre");

    setUsuariosDisponibles(data || []);
    setLoadingUsuarios(false);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setLinkTarget(null);
    setUsuariosDisponibles([]);
    setBusquedaUsuario("");
  };

  const clientePorUsuario = new Map(
    clientes.filter((c) => c.user_id).map((c) => [c.user_id, c])
  );

  const handleVincular = async (usuarioId) => {
    if (!linkTarget) return;

    const yaVinculadoA = clientePorUsuario.get(usuarioId);
    if (yaVinculadoA) {
      const confirmado = window.confirm(
        `Esta cuenta ya está vinculada a la ficha "${yaVinculadoA.nombre}". Si continúas, esa ficha se eliminará y su historial (vehículos y órdenes) se trasladará a "${linkTarget.nombre}". ¿Continuar?`
      );
      if (!confirmado) return;
    }

    setVinculando(true);

    const { error: fusionError } = await supabase.rpc(
      "fusionar_cliente_vinculado",
      {
        p_cliente_destino_id: linkTarget.id,
        p_usuario_id: usuarioId,
      }
    );

    if (fusionError) {
      setVinculando(false);
      setError(fusionError.message);
      return;
    }

    // Si esta cuenta tenía una solicitud de vinculación pendiente, se resuelve
    // sola para que no quede huérfana en la bandeja de solicitudes.
    await supabase
      .from("solicitudes_vinculacion")
      .update({
        estado: "aprobada",
        cliente_id: linkTarget.id,
        fecha_resolucion: new Date().toISOString(),
      })
      .eq("user_id", usuarioId)
      .eq("estado", "pendiente");

    setVinculando(false);
    closeLinkModal();
    fetchClientes();
    fetchSolicitudes();
  };

  const usuariosFiltrados = usuariosDisponibles.filter((u) => {
    const q = busquedaUsuario.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.correo || "").toLowerCase().includes(q)
    );
  });

  const openSolicitudesModal = () => {
    setSolicitudesModalOpen(true);
    fetchSolicitudes();
  };

  const closeSolicitudesModal = () => {
    setSolicitudesModalOpen(false);
    setSolicitudEnRevision(null);
    setClientesDisponibles([]);
    setBusquedaClienteDisponible("");
  };

  const iniciarRevision = async (solicitud) => {
    setSolicitudEnRevision(solicitud);
    setBusquedaClienteDisponible("");
    setClienteYaVinculado(null);
    setLoadingClientesDisponibles(true);

    // Puede que esta cuenta ya se haya vinculado a un cliente por otra vía
    // (ej. vinculación manual desde el modal de Vincular cuenta) mientras la
    // solicitud seguía pendiente. En ese caso no aparecerá ningún cliente
    // "sin vincular" que coincida, y hay que ofrecer resolverla directamente.
    const { data: yaVinculado } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, correo")
      .eq("es_demo", false)
      .eq("user_id", solicitud.user_id)
      .maybeSingle();

    if (yaVinculado) {
      setClienteYaVinculado(yaVinculado);
      setClientesDisponibles([]);
      setLoadingClientesDisponibles(false);
      return;
    }

    const { data } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, correo")
      .eq("es_demo", false)
      .is("user_id", null)
      .order("nombre");

    const digitosSolicitud = soloDigitos(solicitud.telefono_ingresado);
    const ordenados = [...(data || [])].sort((a, b) => {
      const aCoincide = digitosSolicitud && soloDigitos(a.telefono) === digitosSolicitud;
      const bCoincide = digitosSolicitud && soloDigitos(b.telefono) === digitosSolicitud;
      if (aCoincide && !bCoincide) return -1;
      if (!aCoincide && bCoincide) return 1;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });

    setClientesDisponibles(ordenados);
    setLoadingClientesDisponibles(false);
  };

  const volverALista = () => {
    setSolicitudEnRevision(null);
    setClientesDisponibles([]);
    setBusquedaClienteDisponible("");
    setClienteYaVinculado(null);
  };

  const handleAprobarSolicitud = async (clienteId) => {
    if (!solicitudEnRevision) return;
    setResolviendo(true);

    const { error: linkError } = await supabase
      .from("clientes")
      .update({ user_id: solicitudEnRevision.user_id })
      .eq("id", clienteId);

    if (linkError) {
      setResolviendo(false);
      setError(linkError.message);
      return;
    }

    const { error: solicitudError } = await supabase
      .from("solicitudes_vinculacion")
      .update({
        estado: "aprobada",
        cliente_id: clienteId,
        fecha_resolucion: new Date().toISOString(),
      })
      .eq("id", solicitudEnRevision.id);

    setResolviendo(false);

    if (solicitudError) {
      setError(solicitudError.message);
      return;
    }

    volverALista();
    fetchClientes();
    fetchSolicitudes();
  };

  const handleRechazarSolicitud = async (solicitud) => {
    const confirmado = window.confirm(
      `¿Rechazar la solicitud de ${solicitud.usuarios?.nombre || solicitud.usuarios?.correo || "este usuario"}?`
    );
    if (!confirmado) return;

    const { error: rechazoError } = await supabase
      .from("solicitudes_vinculacion")
      .update({ estado: "rechazada", fecha_resolucion: new Date().toISOString() })
      .eq("id", solicitud.id);

    if (rechazoError) {
      setError(rechazoError.message);
    } else {
      fetchSolicitudes();
    }
  };

  const clientesDisponiblesFiltrados = clientesDisponibles.filter((c) => {
    const q = busquedaClienteDisponible.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.telefono || "").toLowerCase().includes(q) ||
      (c.correo || "").toLowerCase().includes(q)
    );
  });

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
                onClick={openSolicitudesModal}
                className="flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-primary px-4 py-3 text-sm font-semibold hover:bg-blue-500/20 transition"
              >
                <Inbox className="h-4 w-4" />
                Solicitudes pendientes ({solicitudes.length})
              </button>
            )}

            <button
              onClick={openCreateModal}
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

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Todavía no hay clientes registrados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
              <thead className="bg-card/80 text-muted-foreground">
                <tr>
                  <th className="text-left p-4">Nombre</th>
                  <th className="text-left p-4">Teléfono</th>
                  <th className="text-left p-4">Correo</th>
                  <th className="text-left p-4">Dirección</th>
                  <th className="text-left p-4">Ingreso</th>
                  <th className="text-left p-4">Cuenta</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {clientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-t border-foreground/10 hover:bg-card/40 transition"
                  >
                    <td className="p-4 font-semibold text-foreground">
                      {cliente.nombre}
                      {cliente.bloqueado && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 text-[10px] font-semibold align-middle">
                          <ShieldOff className="h-3 w-3" />
                          Bloqueado
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {cliente.telefono || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {cliente.correo || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {cliente.direccion || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {cliente.fecha_ingreso
                        ? new Date(cliente.fecha_ingreso).toLocaleDateString(
                            "es-CR"
                          )
                        : "—"}
                    </td>
                    <td className="p-4">
                      {cliente.user_id ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                          <UserCheck className="h-3.5 w-3.5" />
                          Vinculada
                        </span>
                      ) : (
                        <button
                          onClick={() => openLinkModal(cliente)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-blue-500/20 transition"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Vincular cuenta
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {cliente.user_id ? (
                          <span
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/40 text-muted-foreground/50 cursor-not-allowed"
                            title="Este cliente ya está vinculado: sus datos de contacto los administra él mismo desde su portal."
                          >
                            <Lock className="h-4 w-4" />
                          </span>
                        ) : (
                          <button
                            onClick={() => openEditModal(cliente)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleBloqueo(cliente)}
                          disabled={bloqueandoId === cliente.id}
                          className={`h-9 w-9 flex items-center justify-center rounded-xl border transition disabled:opacity-60 ${
                            cliente.bloqueado
                              ? "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                              : "border-foreground/10 bg-card/60 hover:bg-yellow-500/20 hover:border-yellow-500/30"
                          }`}
                          title={
                            cliente.bloqueado
                              ? "Desbloquear cliente"
                              : "Bloquear cliente (perfil en revisión)"
                          }
                        >
                          {cliente.bloqueado ? (
                            <ShieldOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>

                        <button
                          onClick={() => iniciarEliminacion(cliente)}
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
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="+506 8888-8888"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-accent" />
                  Correo
                </label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) =>
                    setForm({ ...form, correo: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Dirección del cliente"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : editingId
                  ? "Guardar cambios"
                  : "Crear cliente"}
              </button>
            </form>
          </div>
        </div>
      )}

      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground max-h-[80vh] flex flex-col">
            <button
              onClick={closeLinkModal}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-1">
              Vincular cuenta
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Elige la cuenta registrada que corresponde a{" "}
              <span className="font-semibold text-foreground/80">
                {linkTarget?.nombre}
              </span>
              . Si esa cuenta ya tiene otra ficha, se fusionarán en una sola.
            </p>

            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-11 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {loadingUsuarios ? (
                <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Buscando cuentas...
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Todavía no hay ninguna cuenta de cliente registrada en el
                  sistema.
                </div>
              ) : (
                usuariosFiltrados.map((usuario) => {
                  const yaVinculadoA = clientePorUsuario.get(usuario.id);

                  return (
                    <button
                      key={usuario.id}
                      onClick={() => handleVincular(usuario.id)}
                      disabled={vinculando}
                      className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-4 transition disabled:opacity-60 text-left ${
                        yaVinculadoA
                          ? "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                          : "border-foreground/10 bg-card/60 hover:bg-blue-500/10 hover:border-blue-500/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {usuario.nombre || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {usuario.correo}
                        </p>
                        {yaVinculadoA && (
                          <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                            Ya vinculada a "{yaVinculadoA.nombre}" — al
                            elegirla se fusionan ambas fichas
                          </p>
                        )}
                      </div>
                      <Link2 className="h-4 w-4 text-primary shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {solicitudesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground max-h-[80vh] flex flex-col">
            <button
              onClick={closeSolicitudesModal}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            {!solicitudEnRevision ? (
              <>
                <h2 className="text-xl font-bold mb-1">
                  Solicitudes de vinculación
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Personas que se registraron y piden vincular su cuenta a un
                  cliente existente.
                </p>

                <div className="overflow-y-auto space-y-3 pr-1">
                  {loadingSolicitudes ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Cargando solicitudes...
                    </div>
                  ) : solicitudes.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No hay solicitudes pendientes.
                    </div>
                  ) : (
                    solicitudes.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-foreground/10 bg-card/60 p-4"
                      >
                        <p className="text-sm font-semibold text-foreground">
                          {s.usuarios?.nombre || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-1">
                          {s.usuarios?.correo}
                        </p>
                        <p className="text-xs text-muted-foreground mb-3">
                          Teléfono enviado:{" "}
                          <span className="font-semibold text-foreground/80">
                            {s.telefono_ingresado || "—"}
                          </span>
                        </p>

                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarRevision(s)}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 text-primary border border-blue-500/30 px-3 py-2 text-xs font-semibold hover:bg-blue-500/25 transition"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Revisar y aprobar
                          </button>
                          <button
                            onClick={() => handleRechazarSolicitud(s)}
                            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-accent px-3 py-2 text-xs font-semibold hover:bg-red-500/20 transition"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rechazar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={volverALista}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver a la lista
                </button>

                <h2 className="text-xl font-bold mb-1">
                  {clienteYaVinculado ? "Solicitud ya resuelta" : "Elige el cliente para vincular"}
                </h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Solicitud de{" "}
                  <span className="font-semibold text-foreground/80">
                    {solicitudEnRevision.usuarios?.nombre || solicitudEnRevision.usuarios?.correo}
                  </span>{" "}
                  · teléfono enviado {solicitudEnRevision.telefono_ingresado || "—"}
                </p>

                {clienteYaVinculado ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                    <p className="text-sm text-foreground">
                      Esta cuenta ya está vinculada al cliente{" "}
                      <span className="font-semibold">{clienteYaVinculado.nombre}</span>{" "}
                      (vinculación manual). Solo falta marcar la solicitud como
                      resuelta para que salga de la bandeja de pendientes.
                    </p>
                    <button
                      onClick={() => handleAprobarSolicitud(clienteYaVinculado.id)}
                      disabled={resolviendo}
                      className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-3 text-sm font-semibold hover:bg-emerald-500/25 transition disabled:opacity-60"
                    >
                      <Check className="h-4 w-4" />
                      {resolviendo ? "Marcando..." : "Marcar solicitud como resuelta"}
                    </button>
                  </div>
                ) : (
                <>
                <div className="relative mb-4 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <input
                    type="text"
                    value={busquedaClienteDisponible}
                    onChange={(e) => setBusquedaClienteDisponible(e.target.value)}
                    placeholder="Buscar por nombre, teléfono o correo..."
                    className="w-full pl-11 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="overflow-y-auto space-y-2 pr-1">
                  {loadingClientesDisponibles ? (
                    <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Buscando clientes...
                    </div>
                  ) : clientesDisponiblesFiltrados.length === 0 ? (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                      No hay clientes sin vincular disponibles.
                    </div>
                  ) : (
                    clientesDisponiblesFiltrados.map((c) => {
                      const coincide =
                        solicitudEnRevision.telefono_ingresado &&
                        soloDigitos(c.telefono) === soloDigitos(solicitudEnRevision.telefono_ingresado);

                      return (
                        <button
                          key={c.id}
                          onClick={() => handleAprobarSolicitud(c.id)}
                          disabled={resolviendo}
                          className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-4 transition disabled:opacity-60 text-left ${
                            coincide
                              ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : "border-foreground/10 bg-card/60 hover:bg-blue-500/10 hover:border-blue-500/30"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {c.nombre}
                              {coincide && (
                                <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                                  Teléfono coincide
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {c.telefono || "—"} · {c.correo || "—"}
                            </p>
                          </div>
                          <Link2 className="h-4 w-4 text-primary shrink-0" />
                        </button>
                      );
                    })
                  )}
                </div>
                </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {ordenesPendientesOpen && clientePendienteOrdenes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground max-h-[85vh] flex flex-col">
            <button
              onClick={cerrarOrdenesPendientes}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-2xl bg-red-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-accent" />
              </div>
              <h2 className="text-lg font-bold">No se puede eliminar todavía</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              <span className="font-semibold text-foreground/80">
                {clientePendienteOrdenes.nombre}
              </span>{" "}
              tiene {ordenesPendientesList.length} orden(es) pendiente(s) o en
              proceso. Márcalas como completadas para poder continuar con la
              eliminación.
            </p>

            <div className="overflow-y-auto space-y-2 pr-1">
              {ordenesPendientesList.map((orden) => (
                <div
                  key={orden.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      #TG-{orden.id}
                      {orden.vehiculos
                        ? ` · ${orden.vehiculos.placa} ${[
                            orden.vehiculos.marca,
                            orden.vehiculos.modelo,
                          ]
                            .filter(Boolean)
                            .join(" ")}`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {orden.descripcion || "Sin descripción"} ·{" "}
                      <span
                        className={
                          orden.estado === "Pendiente"
                            ? "text-accent"
                            : "text-primary"
                        }
                      >
                        {orden.estado}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => marcarOrdenCompletada(orden.id)}
                    disabled={actualizandoOrdenId === orden.id}
                    className="shrink-0 flex items-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-2 text-xs font-semibold hover:bg-emerald-500/25 transition disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {actualizandoOrdenId === orden.id
                      ? "Guardando..."
                      : "Marcar completada"}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={cerrarOrdenesPendientes}
              className="mt-5 w-full py-3 border border-foreground/10 rounded-xl font-semibold text-foreground hover:bg-foreground/5 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {confirmarEliminarOpen && clienteAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground">
            <button
              onClick={cerrarConfirmarEliminar}
              disabled={eliminando}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition disabled:opacity-60"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-2xl bg-yellow-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h2 className="text-lg font-bold">Eliminar cliente</h2>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              <span className="font-semibold text-foreground/80">
                {clienteAEliminar.nombre}
              </span>{" "}
              tiene {infoEliminar?.vehiculos} vehículo(s) con historial ya
              completado. ¿Qué deseas hacer?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => ejecutarEliminacion(clienteAEliminar, "conservar_historial")}
                disabled={eliminando}
                className="w-full text-left rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 hover:bg-blue-500/20 transition disabled:opacity-60"
              >
                <p className="text-sm font-semibold text-primary">
                  Conservar historial
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Se elimina solo la ficha del cliente. Sus vehículos quedan
                  sin dueño, pero su historial de órdenes se mantiene para
                  las estadísticas del taller.
                </p>
              </button>

              <button
                onClick={() => ejecutarEliminacion(clienteAEliminar, "todo")}
                disabled={eliminando}
                className="w-full text-left rounded-2xl border border-red-500/30 bg-red-500/10 p-4 hover:bg-red-500/20 transition disabled:opacity-60"
              >
                <p className="text-sm font-semibold text-accent">
                  Eliminar todo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Se elimina el cliente, sus vehículos y todo su historial de
                  órdenes. No se puede deshacer.
                </p>
              </button>

              <button
                onClick={cerrarConfirmarEliminar}
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
          </div>
        </div>
      )}
    </Layout>
  );
}
