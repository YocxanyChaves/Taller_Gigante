import { METODOS } from "../../services/cobros";
import { formatoColones, montoDe } from "../../lib/formato";
import Campo from "../ui/Campo";

// Monto en colones (solo números) y cómo pagó. Lo usan "Entregar y cobrar"
// y "Registrar abono".

export function CampoMonto({ etiqueta, valor, alCambiar, ayuda, error, autoFocus, opcional }) {
  const monto = montoDe(valor);
  return (
    <Campo
      etiqueta={etiqueta}
      opcional={opcional}
      autoFocus={autoFocus}
      inputMode="numeric"
      autoComplete="off"
      placeholder="₡0"
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      ayuda={monto > 0 ? `${formatoColones(monto)}${ayuda ? ` · ${ayuda}` : ""}` : ayuda}
      error={error}
    />
  );
}

export function ElegirMetodo({ valor, alCambiar }) {
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-bold">¿Cómo pagó?</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {METODOS.map((m) => (
          <button
            key={m.valor}
            type="button"
            aria-pressed={valor === m.valor}
            onClick={() => alCambiar(m.valor)}
            className={
              "min-h-13 rounded-control border-2 px-3 text-lg font-bold transition-colors " +
              (valor === m.valor ? "border-tinta bg-tinta text-white" : "border-linea-fuerte hover:border-tinta")
            }
          >
            {m.texto}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
