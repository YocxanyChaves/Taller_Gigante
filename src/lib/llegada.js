import { soloDigitos } from "./formato";

// Cómo llegó el carro (kilometraje, gasolina y notas): lo que comparten
// «Llegó el carro», el paso «¿Cómo llegó el carro?» del asistente y la ficha.

export const LLEGADA_VACIA = { km: "", sinKm: false, gasolina: null, notas: "" };

export const TEXTO_GASOLINA = { vacio: "Vacío", "1/4": "1/4", "1/2": "1/2", "3/4": "3/4", lleno: "Lleno" };

// El kilometraje como número, o null si está en blanco.
export const kmLlegada = (valores) => (soloDigitos(valores.km) ? Number(soloDigitos(valores.km)) : null);

// Ya se puede seguir: tiene kilometraje o no se puede ver el tablero.
export const llegadaLista = (valores) => kmLlegada(valores) !== null || valores.sinKm;

// Lo que se guarda en el trabajo.
export const datosLlegada = (valores) => ({
  km: kmLlegada(valores),
  combustible: valores.gasolina,
  notas: valores.notas.trim() || null,
});
