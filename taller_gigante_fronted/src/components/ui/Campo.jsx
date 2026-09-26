import { useId } from "react";
import { AlertTriangle } from "lucide-react";

// Campo de formulario: etiqueta arriba siempre visible (nunca solo el
// placeholder), caja plana un poco más oscura que el panel y el error debajo
// en palabras claras.
// Con `multilinea` es un <textarea>. El resto de props van al input.

export default function Campo({
  etiqueta,
  ayuda,
  error,
  opcional = false,
  multilinea = false,
  className = "",
  ...props
}) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describe = [ayuda && idAyuda, error && idError].filter(Boolean).join(" ") || undefined;

  const clasesCaja =
    "w-full border bg-panel-hundido px-4 text-lg text-texto placeholder:text-acero/80 " +
    "transition-colors focus:border-azul-vivo focus:outline-none focus:ring-2 focus:ring-azul-vivo/25 " +
    (error ? "border-rojo" : "border-linea");

  const Control = multilinea ? "textarea" : "input";

  return (
    <div className={className}>
      <label htmlFor={id} className="rotulo mb-1.5 block text-base text-texto-2">
        {etiqueta}
        {opcional && <span className="ml-2 normal-case tracking-normal text-acero">(opcional)</span>}
      </label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe}
        className={`${clasesCaja} ${multilinea ? "min-h-32 py-3" : "h-13"}`}
        {...props}
      />
      {ayuda && (
        <p id={idAyuda} className="mt-1.5 text-base text-texto-2">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} role="alert" className="mt-1.5 flex items-start gap-2 text-base text-rojo-vivo">
          <AlertTriangle aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
