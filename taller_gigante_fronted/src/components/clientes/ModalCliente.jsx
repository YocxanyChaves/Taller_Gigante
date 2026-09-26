import { useState } from "react";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import { guardarCliente } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";

// Crear una ficha nueva (cliente = null) o editar una existente.
export function ModalCliente({ cliente, onClose, onGuardado }) {
  const [form, setForm] = useState({
    nombre: cliente?.nombre || "",
    telefono: cliente?.telefono || "",
    correo: cliente?.correo || "",
    direccion: cliente?.direccion || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error: submitError } = await guardarCliente(form, cliente?.id);

    setSaving(false);

    if (submitError) {
      setError(mensajeError(submitError));
      return;
    }

    onGuardado();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-xl font-bold mb-6">
        {cliente ? "Editar cliente" : "Nuevo cliente"}
      </h2>

      <ErrorEnModal mensaje={error} />

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
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
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
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
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
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
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
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
            placeholder="Dirección del cliente"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 mt-2 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
        >
          {saving ? "Guardando..." : cliente ? "Guardar cambios" : "Crear cliente"}
        </button>
      </form>
    </Modal>
  );
}
