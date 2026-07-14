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
  CalendarClock,
  AlertTriangle,
} from "lucide-react";
import { calcularEstadoDekra } from "../lib/dekra";

const emptyForm = {
  id_cliente: "",
  placa: "",
  marca: "",
  modelo: "",
  año: "",
  color: "",
  kilometraje: "",
  ultima_revision_tecnica: "",
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
      ultima_revision_tecnica: vehiculo.ultima_revision_tecnica
        ? vehiculo.ultima_revision_tecnica.slice(0, 10)
        : "",
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
      ultima_revision_tecnica: form.ultima_revision_tecnica || null,
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
            <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <Car className="h-6 w-6 text-primary" />
              Vehículos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
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
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando vehículos...
            </div>
          ) : vehiculos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <Car className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Todavía no hay vehículos registrados.
              </p>
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
                      {[vehiculo.marca, vehiculo.modelo]
                        .filter(Boolean)
                        .join(" ") || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {vehiculo.año || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {vehiculo.color || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {vehiculo.kilometraje || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {vehiculo.clientes?.nombre || "—"}
                    </td>
                    <td className="p-4">
                      {(() => {
                        const estado = calcularEstadoDekra(
                          vehiculo.placa,
                          vehiculo.ultima_revision_tecnica
                        );
                        if (!estado) {
                          return (
                            <span className="text-muted-foreground">—</span>
                          );
                        }
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                              estado.dentroDeVentana
                                ? "bg-red-500/15 text-accent"
                                : "bg-foreground/5 text-muted-foreground"
                            }`}
                            title={
                              estado.dentroDeVentana
                                ? `Vence en ${estado.diasParaVencer} día(s)`
                                : ""
                            }
                          >
                            {estado.dentroDeVentana && (
                              <AlertTriangle className="h-3 w-3" />
                            )}
                            {estado.nombreMes}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(vehiculo)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </button>

                        <button
                          onClick={() => handleDelete(vehiculo)}
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
          <div className="w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto text-foreground">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Editar vehículo" : "Nuevo vehículo"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  Cliente
                </label>
                <select
                  required
                  value={form.id_cliente}
                  onChange={(e) =>
                    setForm({ ...form, id_cliente: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                >
                  <option value="" disabled className="bg-card text-foreground">
                    Selecciona un cliente
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id} className="bg-card text-foreground">
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                {clientes.length === 0 && (
                  <p className="text-xs text-muted-foreground/70">
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
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
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
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
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
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                    placeholder="Hilux"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Color
                </label>
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) =>
                    setForm({ ...form, color: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                  placeholder="Blanco"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-accent" />
                  Kilometraje
                </label>
                <input
                  type="text"
                  value={form.kilometraje}
                  onChange={(e) =>
                    setForm({ ...form, kilometraje: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                  placeholder="45000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Última revisión técnica (DEKRA)
                </label>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    const input = e.currentTarget.querySelector("input");
                    if (input?.showPicker) input.showPicker();
                  }}
                >
                  <input
                    type="date"
                    value={form.ultima_revision_tecnica}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        ultima_revision_tecnica: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                  />
                </div>
                {form.placa && (
                  (() => {
                    const estado = calcularEstadoDekra(form.placa, null);
                    return estado ? (
                      <p className="text-xs text-muted-foreground/70">
                        Según la placa, este vehículo le corresponde{" "}
                        <span className="capitalize font-semibold">
                          {estado.nombreMes}
                        </span>
                        .
                      </p>
                    ) : null;
                  })()
                )}
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
