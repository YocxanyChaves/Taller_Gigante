import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  X,
  Palette,
  Gauge,
  Loader2,
  User,
} from "lucide-react";

const emptyForm = {
  id_cliente: "",
  placa: "",
  marca: "",
  modelo: "",
  año: "",
  color: "",
  kilometraje: "",
};

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchVehiculos = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("vehiculos")
      .select("*, clientes(id, nombre)")
      .order("id", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setVehiculos(data);
    }

    setLoading(false);
  };

  const fetchClientes = async () => {
    const { data, error: fetchError } = await supabase
      .from("clientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (!fetchError) setClientes(data);
  };

  useEffect(() => {
    fetchVehiculos();
    fetchClientes();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (vehiculo) => {
    setEditingId(vehiculo.id);
    setForm({
      id_cliente: vehiculo.id_cliente || "",
      placa: vehiculo.placa || "",
      marca: vehiculo.marca || "",
      modelo: vehiculo.modelo || "",
      año: vehiculo.año || "",
      color: vehiculo.color || "",
      kilometraje: vehiculo.kilometraje || "",
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

    const payload = {
      ...form,
      id_cliente: form.id_cliente ? Number(form.id_cliente) : null,
      año: form.año ? Number(form.año) : null,
    };

    const { error: submitError } = editingId
      ? await supabase.from("vehiculos").update(payload).eq("id", editingId)
      : await supabase.from("vehiculos").insert(payload);

    setSaving(false);

    if (submitError) {
      setError(submitError.message);
      return;
    }

    closeModal();
    fetchVehiculos();
  };

  const handleDelete = async (vehiculo) => {
    const confirmado = window.confirm(
      `¿Eliminar el vehículo con placa ${vehiculo.placa}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const { error: deleteError } = await supabase
      .from("vehiculos")
      .delete()
      .eq("id", vehiculo.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      setVehiculos((prev) => prev.filter((v) => v.id !== vehiculo.id));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
              <Car className="h-6 w-6 text-blue-500 dark:text-blue-400" />
              Vehículos
            </h1>
            <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
              Vehículos registrados en el taller
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-3 text-sm font-semibold text-white hover:from-red-700 hover:to-blue-700 transition-all"
          >
            <Plus className="h-4 w-4" />
            Nuevo vehículo
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
              Cargando vehículos...
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Car className="h-10 w-10 text-zinc-300 dark:text-white/20 mb-3" />
              <p className="text-zinc-500 dark:text-white/50">
                Todavía no hay vehículos registrados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
              <thead className="bg-black/[0.03] dark:bg-white/[0.06] text-zinc-500 dark:text-white/50">
                <tr>
                  <th className="text-left p-4">Placa</th>
                  <th className="text-left p-4">Marca / Modelo</th>
                  <th className="text-left p-4">Año</th>
                  <th className="text-left p-4">Color</th>
                  <th className="text-left p-4">Kilometraje</th>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {vehiculos.map((vehiculo) => (
                  <tr
                    key={vehiculo.id}
                    className="border-t border-black/10 dark:border-white/10 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition"
                  >
                    <td className="p-4 font-semibold text-zinc-900 dark:text-white">{vehiculo.placa}</td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {[vehiculo.marca, vehiculo.modelo]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {vehiculo.año || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {vehiculo.color || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {vehiculo.kilometraje || "—"}
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-white/70">
                      {vehiculo.clientes?.nombre || "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(vehiculo)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        </button>

                        <button
                          onClick={() => handleDelete(vehiculo)}
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
          <div className="w-full max-w-lg rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0b0e14] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-zinc-900 dark:text-white">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-zinc-400 dark:text-white/40 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Editar vehículo" : "Nuevo vehículo"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-red-500 dark:text-red-400" />
                  Cliente
                </label>
                <select
                  required
                  value={form.id_cliente}
                  onChange={(e) =>
                    setForm({ ...form, id_cliente: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                >
                  <option value="" disabled>
                    Selecciona un cliente
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                {clientes.length === 0 && (
                  <p className="text-xs text-zinc-400 dark:text-white/40">
                    Primero registra un cliente en el módulo de Clientes.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Placa</label>
                  <input
                    type="text"
                    required
                    value={form.placa}
                    onChange={(e) =>
                      setForm({ ...form, placa: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
                    placeholder="ABC-123"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Año</label>
                  <input
                    type="number"
                    value={form.año}
                    onChange={(e) =>
                      setForm({ ...form, año: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
                    placeholder="2020"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Marca</label>
                  <input
                    type="text"
                    value={form.marca}
                    onChange={(e) =>
                      setForm({ ...form, marca: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                    placeholder="Toyota"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Modelo</label>
                  <input
                    type="text"
                    value={form.modelo}
                    onChange={(e) =>
                      setForm({ ...form, modelo: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                    placeholder="Hilux"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Color
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) =>
                    setForm({ ...form, color: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-blue-400"
                  placeholder="Blanco"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-red-500 dark:text-red-400" />
                  Kilometraje
                </label>
                <input
                  type="text"
                  value={form.kilometraje}
                  onChange={(e) =>
                    setForm({ ...form, kilometraje: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl focus:outline-none focus:border-red-500"
                  placeholder="45000"
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
                  : "Crear vehículo"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
