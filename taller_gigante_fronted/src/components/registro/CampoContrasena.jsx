import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

const etiquetasFortaleza = ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte"];

function fortaleza(pass) {
  let puntos = 0;
  if (pass.length >= 8) puntos++;
  if (/[A-Z]/.test(pass)) puntos++;
  if (/[0-9]/.test(pass)) puntos++;
  if (/[^A-Za-z0-9]/.test(pass)) puntos++;
  return puntos;
}

// Campo de contraseña con botón para mostrarla y, opcionalmente, la barra de
// fortaleza.
export function CampoContrasena({ etiqueta, placeholder, value, onChange, mostrarFortaleza = false }) {
  const [visible, setVisible] = useState(false);
  const puntos = fortaleza(value);

  return (
    <div className="space-y-2">
      <label className="text-foreground font-medium flex items-center gap-2 text-sm">
        <Lock className="w-4 h-4 text-primary" />
        {etiqueta}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full px-4 py-4 pr-12 bg-foreground/5 border border-foreground/15 text-foreground placeholder:text-muted-foreground rounded-lg focus:outline-none focus:border-primary"
        />

        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
        >
          {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {mostrarFortaleza && value.length > 0 && (
        <div className="space-y-2">
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < puntos
                    ? puntos >= 3
                      ? "bg-green-500"
                      : puntos >= 2
                      ? "bg-yellow-500"
                      : "bg-accent"
                    : "bg-foreground/10"
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Fortaleza:{" "}
            <span className="font-medium text-primary">{etiquetasFortaleza[puntos]}</span>
          </p>
        </div>
      )}
    </div>
  );
}
