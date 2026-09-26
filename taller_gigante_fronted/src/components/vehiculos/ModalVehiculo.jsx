import { useState } from "react";
import { Palette, Gauge, User, CalendarClock, AlertTriangle } from "lucide-react";
import { Modal } from "../Modal";
import { guardarVehiculo } from "../../services/vehiculos";
import { calcularEstadoDekra } from "../../lib/dekra";
import { mensajeError } from "../../lib/errores";

const claseInput =
  "w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none";

function formInicial(vehiculo) {
  return {
    id_cliente: vehiculo?.id_cliente || "",
    placa: vehiculo?.placa || "",
    marca: vehiculo?.marca || "",
    modelo: vehiculo?.modelo || "",
    año: vehiculo?.año || "",
    color: vehiculo?.color || "",
    kilometraje: vehiculo?.kilometraje ?? "",
    ultima_revision_tecnica: vehiculo?.ultima_revision_tecnica?.slice(0, 10) || "",
  };
}

// Crear un vehículo (vehiculo = null) o editar uno existente.
export function ModalVehiculo({ vehiculo, clientes, onClose, onGuardado }) {
  const [form, setForm] = useState(() => formInicial(vehiculo));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });
  const mesDekra = form.placa ? calcularEstadoDekra(form.placa, null)?.nombreMes : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: submitError } = await guardarVehiculo(form, vehiculo?.id);

    setSaving(false);

    if (submitError) {
      setError(mensajeError(submitError));
      return;
    }

    onGuardado();
  };

  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-6">
        {vehiculo ? "Editar vehículo" : "Nuevo vehículo"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            Cliente
          </label>
          <select
            required
            value={form.id_cliente}
            onChange={cambiar("id_cliente")}
            className={`${claseInput} focus:border-accent`}
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
              onChange={cambiar("placa")}
              className={`${claseInput} focus:border-primary`}
              placeholder="ABC-123"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Año</label>
            <input
              type="number"
              value={form.año}
              onChange={cambiar("año")}
              className={`${claseInput} focus:border-primary`}
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
              onChange={cambiar("marca")}
              className={`${claseInput} focus:border-accent`}
              placeholder="Toyota"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Modelo</label>
            <input
              type="text"
              value={form.modelo}
              onChange={cambiar("modelo")}
              className={`${claseInput} focus:border-accent`}
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
            onChange={cambiar("color")}
            className={`${claseInput} focus:border-primary`}
            placeholder="Blanco"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent" />
            Kilometraje
          </label>
          <input
            type="number"
            min="0"
            value={form.kilometraje}
            onChange={cambiar("kilometraje")}
            className={`${claseInput} focus:border-accent`}
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
              onChange={cambiar("ultima_revision_tecnica")}
              className={`${claseInput} focus:border-primary cursor-pointer`}
            />
          </div>
          {mesDekra && (
            <p className="text-xs text-muted-foreground/70">
              Según la placa, este vehículo le corresponde{" "}
              <span className="capitalize font-semibold">{mesDekra}</span>.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
        >
          {saving ? "Guardando..." : vehiculo ? "Guardar cambios" : "Crear vehículo"}
        </button>
      </form>
    </Modal>
  );
}
