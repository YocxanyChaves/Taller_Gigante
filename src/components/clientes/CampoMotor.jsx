import Campo from "../ui/Campo";

// Tipo de motor: se escribe libre ("1.5 gasolina", "2.8 diésel turbo") o se
// toca uno de los comunes. Lo usan «Agregar un carro» y «Cambiar datos del carro».

const COMUNES = ["Gasolina", "Diésel", "Híbrido", "Eléctrico"];

export default function CampoMotor({ valor, alCambiar, autoFocus }) {
  return (
    <div className="flex flex-col gap-2">
      <Campo
        etiqueta="Tipo de motor"
        opcional
        autoFocus={autoFocus}
        autoComplete="off"
        maxLength={60}
        placeholder="Por ejemplo: 1.5 gasolina, 2.8 diésel turbo"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        {COMUNES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={valor === m}
            onClick={() => alCambiar(valor === m ? "" : m)}
            className={`min-h-11 rounded-control border-2 px-4 text-base font-bold transition-colors ${
              valor === m ? "border-tinta bg-suave text-tinta" : "border-linea-fuerte text-gris hover:border-tinta"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
