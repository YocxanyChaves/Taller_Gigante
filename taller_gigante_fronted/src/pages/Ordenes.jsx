import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import {
  ClipboardList,
  Plus,
  Pencil,
  Trash2,
  X,
  Car,
  DollarSign,
  CalendarClock,
  Loader2,
} from "lucide-react";
import {
  formatoColones,
  numeroONull,
  fechaInputAISO,
  isoAFechaInput,
} from "../lib/formato";
import { mensajeError } from "../lib/errores";

const ESTADOS = ["Pendiente", "En proceso", "Completado"];

const emptyForm = {
  id_vehiculo: "",
  descripcion: "",
  diagnostico: "",
  estado: "Pendiente",
  costo_estimado: "",
  costo_final: "",
  fecha_entrega: "",
};

const estadoStyles = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchOrdenes = async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("ordenes")
      .select("*, vehiculos(id, placa, marca, modelo, clientes(id, nombre))")
      .order("id", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setOrdenes(data);
    }

    setLoading(false);
  };

  const fetchVehiculos = async () => {
    const { data, error: fetchError } = await supabase
      .from("vehiculos")
      .select("id, placa, marca, modelo, clientes(nombre)")
      .order("placa", { ascending: true });

    if (!fetchError) setVehiculos(data);
  };

  useEffect(() => {
    fetchOrdenes();
    fetchVehiculos();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (orden) => {
    setEditingId(orden.id);
    setForm({
      id_vehiculo: orden.id_vehiculo || "",
      descripcion: orden.descripcion || "",
      diagnostico: orden.diagnostico || "",
      estado: orden.estado || "Pendiente",
      costo_estimado: orden.costo_estimado ?? "",
      costo_final: orden.costo_final ?? "",
      fecha_entrega: isoAFechaInput(orden.fecha_entrega),
    });
    setFormError("");
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
      id_vehiculo: form.id_vehiculo ? Number(form.id_vehiculo) : null,
      costo_estimado: numeroONull(form.costo_estimado),
      costo_final: numeroONull(form.costo_final),
      fecha_entrega: fechaInputAISO(form.fecha_entrega),
    };

    const { error: submitError } = editingId
      ? await supabase.from("ordenes").update(payload).eq("id", editingId)
      : await supabase.from("ordenes").insert(payload);

    setSaving(false);

    if (submitError) {
      setFormError(mensajeError(submitError));
      return;
    }

    closeModal();
    fetchOrdenes();
  };

  const handleDelete = async (orden) => {
    const confirmado = window.confirm(
      `¿Eliminar la orden #${orden.id}? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    const { error: deleteError } = await supabase
      .from("ordenes")
      .delete()
      .eq("id", orden.id);

    if (deleteError) {
      setError(deleteError.message);
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
            onClick={openCreateModal}
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

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando órdenes...
            </div>
          ) : ordenes.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <ClipboardList className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Todavía no hay órdenes registradas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
              <thead className="bg-card/80 text-muted-foreground">
                <tr>
                  <th className="text-left p-4">Orden</th>
                  <th className="text-left p-4">Vehículo</th>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Costo est. / final</th>
                  <th className="text-left p-4">Entrega</th>
                  <th className="text-right p-4">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-t border-foreground/10 hover:bg-card/40 transition"
                  >
                    <td className="p-4 font-semibold text-foreground">#TG-{orden.id}</td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos
                        ? `${orden.vehiculos.placa} · ${[
                            orden.vehiculos.marca,
                            orden.vehiculos.modelo,
                          ]
                            .filter(Boolean)
                            .join(" ")}`
                        : "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos?.clientes?.nombre || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          estadoStyles[orden.estado] ||
                          "bg-foreground/5 text-muted-foreground"
                        }`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.costo_estimado != null
                        ? formatoColones(orden.costo_estimado)
                        : "—"}{" "}
                      /{" "}
                      {orden.costo_final != null
                        ? formatoColones(orden.costo_final)
                        : "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.fecha_entrega
                        ? new Date(orden.fecha_entrega).toLocaleDateString(
                            "es-CR"
                          )
                        : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(orden)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </button>

                        <button
                          onClick={() => handleDelete(orden)}
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
              {editingId ? "Editar orden" : "Nueva orden"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
                  {formError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4 text-accent" />
                  Vehículo
                </label>
                <select
                  required
                  value={form.id_vehiculo}
                  onChange={(e) =>
                    setForm({ ...form, id_vehiculo: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                >
                  <option value="" disabled className="bg-card text-foreground">
                    Selecciona un vehículo
                  </option>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id} className="bg-card text-foreground">
                      {v.placa} · {[v.marca, v.modelo].filter(Boolean).join(" ")}
                      {v.clientes?.nombre ? ` (${v.clientes.nombre})` : ""}
                    </option>
                  ))}
                </select>
                {vehiculos.length === 0 && (
                  <p className="text-xs text-muted-foreground/70">
                    Primero registra un vehículo en el módulo de Vehículos.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary resize-none"
                  placeholder="Motivo de ingreso del vehículo"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnóstico</label>
                <textarea
                  value={form.diagnostico}
                  onChange={(e) =>
                    setForm({ ...form, diagnostico: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary resize-none"
                  placeholder="Diagnóstico del mecánico"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) =>
                    setForm({ ...form, estado: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                >
                  {ESTADOS.map((estado) => (
                    <option key={estado} value={estado} className="bg-card text-foreground">
                      {estado}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Costo estimado
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.costo_estimado}
                    onChange={(e) =>
                      setForm({ ...form, costo_estimado: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                    placeholder="50000"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-accent" />
                    Costo final
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.costo_final}
                    onChange={(e) =>
                      setForm({ ...form, costo_final: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-accent"
                    placeholder="55000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  Fecha de entrega
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
                    value={form.fecha_entrega}
                    onChange={(e) =>
                      setForm({ ...form, fecha_entrega: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary cursor-pointer"
                  />
                </div>
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
                  : "Crear orden"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
