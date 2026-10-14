import { useState } from "react";
import { soloDigitos } from "../../lib/formato";
import Dialogo from "../ui/Dialogo";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";

// "Ya llegó el carro": kilometraje, gasolina y notas de cómo llegó. Todo es
// opcional; con "Guardar" el carro pasa a revisión.

const GASOLINA = [
  { valor: "vacio", texto: "Vacío" },
  { valor: "1/4", texto: "1/4" },
  { valor: "1/2", texto: "1/2" },
  { valor: "3/4", texto: "3/4" },
  { valor: "lleno", texto: "Lleno" },
];

export default function DialogoLlegada({ abierto, guardando, error, alGuardar, alCerrar }) {
  const [km, setKm] = useState("");
  const [gasolina, setGasolina] = useState(null);
  const [notas, setNotas] = useState("");

  return (
    <Dialogo
      abierto={abierto}
      titulo="Llegó el carro"
      alCerrar={alCerrar}
      alEnviar={() =>
        alGuardar({
          km: km ? Number(soloDigitos(km)) : null,
          combustible: gasolina,
          notas: notas.trim() || null,
        })
      }
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar y pasar a revisión"}
          </Boton>
        </>
      }
    >
      <p>Si quiere, anote cómo llegó. Puede dejar todo en blanco.</p>
      <div className="mt-5 flex flex-col gap-5 text-tinta">
        <Campo
          etiqueta="Kilometraje"
          opcional
          autoFocus
          inputMode="numeric"
          placeholder="85 000"
          value={km}
          onChange={(e) => setKm(e.target.value)}
        />

        <fieldset>
          <legend className="mb-2 text-lg font-bold">
            Gasolina <span className="font-normal text-gris">(opcional)</span>
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {GASOLINA.map(({ valor, texto }) => (
              <button
                key={valor}
                type="button"
                aria-pressed={gasolina === valor}
                onClick={() => setGasolina(gasolina === valor ? null : valor)}
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
          onChange={(e) => setNotas(e.target.value)}
        />

        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
