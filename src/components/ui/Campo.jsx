import { useId } from "react";
import { AlertTriangle } from "lucide-react";

// Campo de formulario: etiqueta arriba siempre visible (nunca solo el
// placeholder), caja blanca con borde que se oscurece al escribir y el error
// debajo en palabras claras. `grande` es para el dato principal de un paso
// del asistente (la placa, el teléfono). Con `multilinea` es un <textarea>.

export default function Campo({
  etiqueta,
  ayuda,
  error,
  opcional = false,
  multilinea = false,
  grande = false,
  className = "",
  ...props
}) {
  const id = useId();
  const idAyuda = `${id}-ayuda`;
  const idError = `${id}-error`;
  const describe = [ayuda && idAyuda, error && idError].filter(Boolean).join(" ") || undefined;

  const clasesCaja =
    "w-full rounded-tarjeta border-2 bg-tarjeta px-5 text-tinta placeholder:text-gris-claro " +
    "transition-[border-color,box-shadow] duration-200 focus:border-tinta focus:outline-none " +
    "focus:shadow-[0_0_0_4px_rgb(26_26_26/0.08)] " +
    (error ? "border-rojo " : "border-linea-fuerte ") +
    (multilinea
      ? "min-h-36 py-4 text-lg"
      : grande
        ? "h-22 text-4xl font-bold tracking-wider"
        : "h-14 text-lg");

  const Control = multilinea ? "textarea" : "input";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-lg font-bold">
        {etiqueta}
        {opcional && <span className="ml-2 font-normal text-gris">(opcional)</span>}
      </label>
      <Control
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe}
        className={clasesCaja}
        {...props}
      />
      {ayuda && (
        <p id={idAyuda} className="mt-2 text-base text-gris">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={idError} role="alert" className="animar-entrada mt-2 flex items-start gap-2 text-base font-bold text-rojo">
          <AlertTriangle aria-hidden="true" size={20} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
