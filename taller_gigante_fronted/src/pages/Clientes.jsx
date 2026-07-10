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
  Unlink,
  Search,
  UserCheck,
} from "lucide-react";

const emptyForm = { nombre: "", telefono: "", correo: "", direccion: "" };

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

  useEffect(() => {
    fetchClientes();
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

  const handleDelete = async (cliente) => {
    const confirmado = window.confirm(
      `¿Eliminar a ${cliente.nombre}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const { error: deleteError } = await supabase
      .from("clientes")
      .delete()
      .eq("id", cliente.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
    }
  };

  const openLinkModal = async (cliente) => {
    setLinkTarget(cliente);
    setLinkModalOpen(true);
    setBusquedaUsuario("");
    setLoadingUsuarios(true);

    const { data } = await supabase
      .from("usuarios")
      .select("id, nombre, correo")
      .eq("rol", "cliente")
      .order("nombre");

    const vinculados = new Set(
      clientes.map((c) => c.user_id).filter(Boolean)
    );

    setUsuariosDisponibles((data || []).filter((u) => !vinculados.has(u.id)));
    setLoadingUsuarios(false);
  };

  const closeLinkModal = () => {
    setLinkModalOpen(false);
    setLinkTarget(null);
    setUsuariosDisponibles([]);
    setBusquedaUsuario("");
  };

  const handleVincular = async (usuarioId) => {
    if (!linkTarget) return;
    setVinculando(true);

    const { error: linkError } = await supabase
      .from("clientes")
      .update({ user_id: usuarioId })
      .eq("id", linkTarget.id);

    setVinculando(false);

    if (linkError) {
      setError(linkError.message);
      return;
    }

    closeLinkModal();
    fetchClientes();
  };

  const handleDesvincular = async (cliente) => {
    const confirmado = window.confirm(
      `¿Desvincular la cuenta asociada a ${cliente.nombre}? La persona dejará de ver su información hasta que se vuelva a vincular.`
    );
    if (!confirmado) return;

    const { error: unlinkError } = await supabase
      .from("clientes")
      .update({ user_id: null })
      .eq("id", cliente.id);

    if (unlinkError) {
      setError(unlinkError.message);
    } else {
      fetchClientes();
    }
  };

  const usuariosFiltrados = usuariosDisponibles.filter((u) => {
    const q = busquedaUsuario.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.correo || "").toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
              <Users className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              Clientes
            </h1>
            <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
              Clientes registrados en el taller
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo cliente
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] shadow-2xl shadow-black/5 dark:shadow-black/30 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-zinc-500 dark:text-white/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando clientes...
            </div>
          ) : clientes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Users className="h-10 w-10 text-zinc-300 dark:text-white/20 mb-3" />
              <p className="text-zinc-500 dark:text-white/50">
                Todavía no hay clientes registrados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
              <thead className="bg-black/[0.03] dark:bg-white/[0.06] text-zinc-500 dark:text-white/50">
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
                    className="border-t border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition"
                  >
                    <td className="p-4 font-semibold text-zinc-900 dark:text-white">{cliente.nombre}</td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {cliente.telefono || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {cliente.correo || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {cliente.direccion || "—"}
                    </td>
                    <td className="p-4 text-zinc-500 dark:text-white/50">
                      {cliente.fecha_ingreso
                        ? new Date(cliente.fecha_ingreso).toLocaleDateString(
                            "es-CR"
                          )
                        : "—"}
                    </td>
                    <td className="p-4">
                      {cliente.user_id ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                            <UserCheck className="h-3.5 w-3.5" />
                            Vinculada
                          </span>
                          <button
                            onClick={() => handleDesvincular(cliente)}
                            className="h-8 w-8 flex items-center justify-center rounded-lg border border-black/10 dark:border-white/10 hover:bg-red-500/20 hover:border-red-500/30 transition"
                            title="Desvincular cuenta"
                          >
                            <Unlink className="h-3.5 w-3.5 text-red-600 dark:text-red-300" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openLinkModal(cliente)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 px-3 py-1.5 text-xs font-semibold hover:bg-blue-500/20 transition"
                        >
                          <Link2 className="h-3.5 w-3.5" />
                          Vincular cuenta
                        </button>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cliente)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </button>

                        <button
                          onClick={() => handleDelete(cliente)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-red-500/20 hover:border-red-500/30 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-300" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b0e14] p-8 shadow-2xl relative text-zinc-900 dark:text-white">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Editar cliente" : "Nuevo cliente"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-red-500 dark:text-red-400" />
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="Nombre completo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
                  placeholder="+506 8888-8888"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-red-500 dark:text-red-400" />
                  Correo
                </label>
                <input
                  type="email"
                  value={form.correo}
                  onChange={(e) =>
                    setForm({ ...form, correo: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Dirección
                </label>
                <input
                  type="text"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b0e14] p-8 shadow-2xl relative text-zinc-900 dark:text-white max-h-[80vh] flex flex-col">
            <button
              onClick={closeLinkModal}
              className="absolute right-6 top-6 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-1">
              Vincular cuenta
            </h2>
            <p className="text-sm text-zinc-500 dark:text-white/45 mb-5">
              Elige la cuenta registrada que corresponde a{" "}
              <span className="font-semibold text-zinc-700 dark:text-white/70">
                {linkTarget?.nombre}
              </span>
              .
            </p>

            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-white/40" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-11 pr-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="overflow-y-auto space-y-2 pr-1">
              {loadingUsuarios ? (
                <div className="flex items-center justify-center gap-3 p-10 text-zinc-500 dark:text-white/50">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Buscando cuentas...
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500 dark:text-white/45">
                  No hay cuentas de cliente disponibles para vincular. La
                  persona debe registrarse primero en el sistema.
                </div>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <button
                    key={usuario.id}
                    onClick={() => handleVincular(usuario.id)}
                    disabled={vinculando}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 hover:bg-blue-500/10 hover:border-blue-500/30 transition disabled:opacity-60 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                        {usuario.nombre || "—"}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-white/45 truncate">
                        {usuario.correo}
                      </p>
                    </div>
                    <Link2 className="h-4 w-4 text-blue-500 dark:text-blue-300 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
