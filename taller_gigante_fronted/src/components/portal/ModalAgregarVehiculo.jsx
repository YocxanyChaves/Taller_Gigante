import { useState } from "react";
import { Car, X, AlertCircle, Palette, Gauge, CalendarClock } from "lucide-react";
import { agregarVehiculo } from "../../services/portal";
import { mensajeError } from "../../lib/errores";

const formVacio = {
  placa: "",
  marca: "",
  modelo: "",
  año: "",
  color: "",
  kilometraje: "",
  ultima_revision_tecnica: "",
};

const claseInput =
  "w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none";

// El cliente registra un vehículo propio desde el portal.
export function ModalAgregarVehiculo({ clienteId, onClose, onGuardado }) {
  const [form, setForm] = useState(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (campo) => (e) => setForm({ ...form, [campo]: e.target.value });

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");

    const { error: guardarError } = await agregarVehiculo(clienteId, form);

    setGuardando(false);

    if (guardarError) {
      setError(mensajeError(guardarError));
      return;
    }

    onGuardado();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-foreground/10 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Agregar vehículo
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Car className="h-4 w-4 text-accent" />
                Placa
              </label>
              <input
                type="text"
                required
                value={form.placa}
                onChange={cambiar("placa")}
                placeholder="Ej. CL-123456"
                className={`${claseInput} focus:border-accent uppercase`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Marca</label>
              <input
                type="text"
                value={form.marca}
                onChange={cambiar("marca")}
                className={`${claseInput} focus:border-primary`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Modelo</label>
              <input
                type="text"
                value={form.modelo}
                onChange={cambiar("modelo")}
                className={`${claseInput} focus:border-primary`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Año</label>
              <input
                type="number"
                value={form.año}
                onChange={cambiar("año")}
                className={`${claseInput} focus:border-primary`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Palette className="h-4 w-4 text-accent" />
                Color
              </label>
              <input
                type="text"
                value={form.color}
                onChange={cambiar("color")}
                className={`${claseInput} focus:border-accent`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Gauge className="h-4 w-4 text-primary" />
                Kilometraje
              </label>
              <input
                type="number"
                min="0"
                value={form.kilometraje}
                onChange={cambiar("kilometraje")}
                className={`${claseInput} focus:border-primary`}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <CalendarClock className="h-4 w-4 text-accent" />
                Última revisión técnica (DEKRA)
              </label>
              <input
                type="date"
                value={form.ultima_revision_tecnica}
                onChange={cambiar("ultima_revision_tecnica")}
                className={`${claseInput} focus:border-accent`}
              />
              <p className="text-xs text-muted-foreground">
                Si no la has hecho todavía, puedes dejar este campo vacío.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar vehículo"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-foreground/10 text-foreground hover:bg-foreground/5 transition flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
