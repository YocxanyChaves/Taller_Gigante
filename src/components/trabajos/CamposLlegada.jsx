import { EyeOff } from "lucide-react";
import { TEXTO_GASOLINA, cambioLectura } from "../../lib/llegada";
import Campo from "../ui/Campo";
import Eleccion from "../ui/Eleccion";

// Cómo llegó el carro: lo que marca el tablero (obligatorio, aclara dudas
// después, salvo que no se pueda ver): kilometraje y debajo millas. Al
// escribir uno, el otro se llena solo, pero se puede corregir a mano; luego la
// gasolina y notas. Lo usan «Llegó el carro» y el paso «¿Cómo llegó el
// carro?» de «Agregar un carro» cuando ya está aquí. Con `soloLectura` pide
// solo lo del tablero (para una visita que ya pasó).
// Es controlado: `valores` empieza como LLEGADA_VACIA (lib/llegada) y
// `alCambiar` recibe solo lo que cambió.

export default function CamposLlegada({ valores, alCambiar, grande = false, soloLectura = false }) {
  const { km, millas, kmAMano, millasAMano, sinKm, gasolina, notas } = valores;
  const ayudaDe = (esteAMano, otroAMano, de) =>
    !esteAMano && otroAMano ? `Calculado de ${de}. Si no cuadra con el tablero, corríjalo aquí.` : undefined;

  return (
    <div className="flex flex-col gap-5 text-tinta">
      <Campo
        etiqueta="Kilometraje (km)"
        grande={grande}
        autoFocus
        inputMode="numeric"
        autoComplete="off"
        placeholder="85000"
        ayuda={ayudaDe(kmAMano, millasAMano, "las millas")}
        value={km}
        onChange={(e) => alCambiar(cambioLectura(valores, "km", e.target.value))}
      />
      <Campo
        etiqueta="Millas"
        grande={grande}
        inputMode="numeric"
        autoComplete="off"
        placeholder="52800"
        ayuda={
          ayudaDe(millasAMano, kmAMano, "los kilómetros") ??
          (millasAMano ? undefined : "Si el tablero marca millas, escríbalas aquí y los kilómetros salen solos.")
        }
        value={millas}
        onChange={(e) => alCambiar(cambioLectura(valores, "mi", e.target.value))}
      />
      <Eleccion
        icono={EyeOff}
        titulo="No se puede ver el tablero"
        ayuda="Sigo sin anotarlo"
        elegida={sinKm}
        onClick={() => alCambiar({ sinKm: !sinKm, km: "", millas: "", kmAMano: false, millasAMano: false })}
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
