import { EyeOff } from "lucide-react";
import { TEXTO_GASOLINA } from "../../lib/llegada";
import Campo from "../ui/Campo";
import Eleccion from "../ui/Eleccion";
import { convertirDistancia, soloDigitos } from "../../lib/formato";

// Cómo llegó el carro: lo que marca el tablero (obligatorio, aclara dudas
// después, salvo que no se pueda ver): kilometraje y debajo millas (al
// escribir uno, el otro sale solo); luego la gasolina y notas. Lo usan «Llegó el carro» y el paso «¿Cómo llegó el carro?» de
// «Agregar un carro» cuando ya está aquí. Con `soloLectura` pide solo lo del
// tablero (para una visita que ya pasó).
// Es controlado: `valores` empieza como LLEGADA_VACIA (lib/llegada) y
// `alCambiar` recibe solo lo que cambió.

export default function CamposLlegada({ valores, alCambiar, grande = false, soloLectura = false }) {
  const { km, sinKm, unidad, gasolina, notas } = valores;
  // Se puede escribir en cualquiera de los dos: el otro se calcula solo. Se
  // guarda el que se escribió (es lo que marca el tablero).
  const lectura = soloDigitos(km);
  const otro = lectura ? String(convertirDistancia(Number(lectura), unidad, unidad === "km" ? "mi" : "km")) : "";
  const valorKm = unidad === "km" ? km : otro;
  const valorMi = unidad === "mi" ? km : otro;

  return (
    <div className="flex flex-col gap-5 text-tinta">
      <Campo
        etiqueta="Kilometraje (km)"
        grande={grande}
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        placeholder="85000"
        ayuda={unidad === "mi" && lectura ? "Calculado de las millas." : undefined}
        value={valorKm}
        onChange={(e) => alCambiar({ km: e.target.value, unidad: "km", sinKm: false })}
      />
      <Campo
        etiqueta="Millas"
        grande={grande}
        inputMode="numeric"
        autoComplete="off"
        placeholder="52800"
        ayuda={
          unidad === "km" && lectura
            ? "Calculado de los kilómetros."
            : "Si el tablero marca millas, escríbalas aquí y los kilómetros salen solos."
        }
        value={valorMi}
        onChange={(e) => alCambiar({ km: e.target.value, unidad: "mi", sinKm: false })}
      />
      <Eleccion
        icono={EyeOff}
        titulo="No se puede ver el tablero"
        ayuda="Sigo sin anotarlo"
        elegida={sinKm}
        onClick={() => alCambiar({ sinKm: !sinKm, km: "" })}
      />

      {!soloLectura && (
        <>
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
        </>
      )}
    </div>
  );
}

// ¿El tablero marca kilómetros o millas? Dos botones grandes, uno marcado.
export function ElegirUnidad({ valor, alCambiar }) {
  return (
    <fieldset>
      <legend className="mb-2 text-lg font-bold">¿Qué marca el tablero?</legend>
      <div className="grid grid-cols-2 gap-2">
        {[
          { valor: "km", texto: "Kilómetros" },
          { valor: "mi", texto: "Millas" },
        ].map((u) => (
          <button
            key={u.valor}
            type="button"
            aria-pressed={valor === u.valor}
            onClick={() => alCambiar(u.valor)}
            className={
              "min-h-13 rounded-control border-2 text-lg font-bold transition-colors " +
              (valor === u.valor ? "border-tinta bg-tinta text-white" : "border-linea-fuerte hover:border-tinta")
            }
          >
            {u.texto}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
