import { EyeOff } from "lucide-react";
import { TEXTO_GASOLINA } from "../../lib/llegada";
import Campo from "../ui/Campo";
import Eleccion from "../ui/Eleccion";

// Cómo llegó el carro: kilometraje (obligatorio, aclara dudas después, salvo
// que no se pueda ver el tablero), gasolina y notas. Lo usan «Llegó el carro»
// y el paso «¿Cómo llegó el carro?» de «Agregar un carro» cuando ya está aquí.
// Es controlado: `valores` empieza como LLEGADA_VACIA (lib/llegada) y
// `alCambiar` recibe solo lo que cambió.

export default function CamposLlegada({ valores, alCambiar, grande = false }) {
  const { km, sinKm, gasolina, notas } = valores;

  return (
    <div className="flex flex-col gap-5 text-tinta">
      <Campo
        etiqueta="Kilometraje"
        grande={grande}
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        placeholder="85 000"
        value={km}
        onChange={(e) => alCambiar({ km: e.target.value, sinKm: false })}
      />
      <Eleccion
        icono={EyeOff}
        titulo="No se puede ver el tablero"
        ayuda="Sigo sin anotarlo"
        elegida={sinKm}
        onClick={() => alCambiar({ sinKm: !sinKm, km: "" })}
      />

      <fieldset>
        <legend className="mb-2 text-lg font-bold">
          Gasolina <span className="font-normal text-gris">(opcional)</span>
        </legend>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(TEXTO_GASOLINA).map(([valor, texto]) => (
            <button
              key={valor}
              type="button"
              aria-pressed={gasolina === valor}
              onClick={() => alCambiar({ gasolina: gasolina === valor ? null : valor })}
              className={
                "min-h-13 rounded-control border-2 text-lg font-bold transition-colors " +
                (gasolina === valor ? "border-tinta bg-tinta text-white" : "border-linea-fuerte hover:border-tinta")
              }
            >
              {texto}
            </button>
          ))}
        </div>
      </fieldset>

      <Campo
        etiqueta="Notas"
        opcional
        multilinea
        placeholder="Por ejemplo: rayón en la puerta, trae llanta de repuesto…"
        value={notas}
        onChange={(e) => alCambiar({ notas: e.target.value })}
      />
    </div>
  );
}
