import { useState } from "react";
import {
  UserCircle,
  Phone,
  Mail,
  MapPin,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { actualizarMisDatos } from "../../services/portal";
import { mensajeError } from "../../lib/errores";

// "Tus datos": el cliente ve y edita su propio contacto.
export function MisDatos({ cliente, onGuardado }) {
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const abrirEdicion = () => {
    setForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || "",
      direccion: cliente.direccion || "",
    });
    setError("");
    setExito(false);
    setEditando(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setExito(false);

    const { error: guardarError } = await actualizarMisDatos(cliente.id, form);

    setGuardando(false);

    if (guardarError) {
      setError(mensajeError(guardarError));
      return;
    }

    setExito(true);
    setEditando(false);
    onGuardado();
  };

  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground">Tus datos</h3>

        {!editando && (
          <button
            onClick={abrirEdicion}
            className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-card/60 px-3 py-2 text-sm text-foreground hover:bg-foreground/5 transition"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
      </div>

      {exito && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Tus datos se actualizaron correctamente.
        </div>
      )}

      {editando ? (
        <form onSubmit={handleGuardar} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <CampoEditable
              icono={UserCircle}
              colorIcono="text-accent"
              etiqueta="Nombre"
              type="text"
              required
              value={form.nombre}
              onChange={(valor) => setForm({ ...form, nombre: valor })}
            />
            <CampoEditable
              icono={Phone}
              colorIcono="text-primary"
              etiqueta="Teléfono"
              type="tel"
              value={form.telefono}
              onChange={(valor) => setForm({ ...form, telefono: valor })}
            />
            <CampoEditable
              icono={Mail}
              colorIcono="text-accent"
              etiqueta="Correo"
              type="email"
              value={form.correo}
              onChange={(valor) => setForm({ ...form, correo: valor })}
            />
            <CampoEditable
              icono={MapPin}
              colorIcono="text-primary"
              etiqueta="Dirección"
              type="text"
              value={form.direccion}
              onChange={(valor) => setForm({ ...form, direccion: valor })}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="px-5 py-3 rounded-xl border border-foreground/10 text-foreground hover:bg-foreground/5 transition flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <Dato icono={UserCircle} colorIcono="text-accent" etiqueta="Nombre" valor={cliente.nombre} />
          <Dato icono={Phone} colorIcono="text-primary" etiqueta="Teléfono" valor={cliente.telefono} />
          <Dato icono={Mail} colorIcono="text-accent" etiqueta="Correo" valor={cliente.correo} />
          <Dato
            icono={MapPin}
            colorIcono="text-primary"
            etiqueta="Dirección"
            valor={cliente.direccion}
            className="sm:col-span-3"
          />
        </div>
      )}
    </div>
  );
}

function CampoEditable({ icono: Icono, colorIcono, etiqueta, onChange, ...input }) {
  const colorBorde = colorIcono === "text-accent" ? "focus:border-accent" : "focus:border-primary";
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
        <Icono className={`h-4 w-4 ${colorIcono}`} />
        {etiqueta}
      </label>
      <input
        {...input}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none ${colorBorde}`}
      />
    </div>
  );
}

function Dato({ icono: Icono, colorIcono, etiqueta, valor, className = "" }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4 ${className}`}>
      <Icono className={`h-5 w-5 ${colorIcono} shrink-0`} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{etiqueta}</p>
        <p className="text-sm font-semibold text-foreground truncate">{valor || "—"}</p>
      </div>
    </div>
  );
}
