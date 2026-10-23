import { soloDigitos } from "./formato";

// Cómo llegó el carro (kilometraje o millaje, gasolina y notas): lo que
// comparten «Llegó el carro», el paso «¿Cómo llegó el carro?» del asistente y
// la ficha. `unidad` es lo que marca el tablero: "km" o "mi" (millas).

export const LLEGADA_VACIA = { km: "", sinKm: false, unidad: "km", gasolina: null, notas: "" };

export const TEXTO_GASOLINA = { vacio: "Vacío", "1/4": "1/4", "1/2": "1/2", "3/4": "3/4", lleno: "Lleno" };

// La lectura del tablero como número, o null si está en blanco.
export const kmLlegada = (valores) => (soloDigitos(valores.km) ? Number(soloDigitos(valores.km)) : null);

// Ya se puede seguir: tiene la lectura o no se puede ver el tablero.
export const llegadaLista = (valores) => kmLlegada(valores) !== null || valores.sinKm;

// Lo que se guarda en el trabajo.
export const datosLlegada = (valores) => ({
  km: kmLlegada(valores),
  unidad: valores.unidad,
  combustible: valores.gasolina,
  notas: valores.notas.trim() || null,
});
