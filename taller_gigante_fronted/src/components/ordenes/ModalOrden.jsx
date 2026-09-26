import { useState } from "react";
import { Car, DollarSign, CalendarClock } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import { ESTADOS, guardarOrden } from "../../services/ordenes";
import { isoAFechaInput } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";

const claseInput =
  "w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none";

function formInicial(orden) {
  return {
    id_vehiculo: orden?.id_vehiculo || "",
    descripcion: orden?.descripcion || "",
    diagnostico: orden?.diagnostico || "",
    estado: orden?.estado || "Pendiente",
    costo_estimado: orden?.costo_estimado ?? "",
    costo_final: orden?.costo_final ?? "",
    fecha_entrega: isoAFechaInput(orden?.fecha_entrega),
  };
}

// Crear una orden (orden = null) o editar una existente.
export function ModalOrden({ orden, vehiculos, onClose, onGuardado }) {
  const [form, setForm] = useState(() => formInicial(orden));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: submitError } = await guardarOrden(form, orden?.id);

    setSaving(false);

    if (submitError) {
      setError(mensajeError(submitError));
      return;
    }

    onGuardado();
  };

  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">{orden ? "Editar orden" : "Nueva orden"}</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <ErrorEnModal mensaje={error} />

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Car className="h-4 w-4 text-accent" />
            Vehículo
          </label>
          <select
            required
            value={form.id_vehiculo}
            onChange={cambiar("id_vehiculo")}
            className={`${claseInput} focus:border-accent`}
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
            onChange={cambiar("descripcion")}
            rows={2}
            className={`${claseInput} focus:border-primary resize-none`}
            placeholder="Motivo de ingreso del vehículo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Diagnóstico</label>
          <textarea
            value={form.diagnostico}
            onChange={cambiar("diagnostico")}
            rows={2}
            className={`${claseInput} focus:border-primary resize-none`}
            placeholder="Diagnóstico del mecánico"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Estado</label>
          <select
            value={form.estado}
            onChange={cambiar("estado")}
            className={`${claseInput} focus:border-accent`}
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
              onChange={cambiar("costo_estimado")}
              className={`${claseInput} focus:border-primary`}
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
              onChange={cambiar("costo_final")}
              className={`${claseInput} focus:border-accent`}
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
              onChange={cambiar("fecha_entrega")}
              className={`${claseInput} focus:border-primary cursor-pointer`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
        >
          {saving ? "Guardando..." : orden ? "Guardar cambios" : "Crear orden"}
        </button>
      </form>
    </Modal>
  );
}
