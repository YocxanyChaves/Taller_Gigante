import { X } from "lucide-react";

// Ventana emergente con fondo oscuro, tarjeta y botón de cerrar.
// `className` agrega clases a la tarjeta (ancho, alto máximo, etc.).
export function Modal({ onClose, closeDisabled = false, className = "max-w-lg", children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div
        className={`w-full rounded-3xl border border-foreground/10 bg-card p-8 shadow-2xl relative text-foreground ${className}`}
      >
        <button
          onClick={onClose}
          disabled={closeDisabled}
          className="absolute right-6 top-6 text-muted-foreground/70 hover:text-foreground transition disabled:opacity-60"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </div>
    </div>
  );
}

export function ErrorEnModal({ mensaje }) {
  if (!mensaje) return null;
  return (
    <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
      {mensaje}
    </div>
  );
}
