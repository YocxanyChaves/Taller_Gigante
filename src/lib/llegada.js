import { convertirDistancia, soloDigitos } from "./formato";

// Cómo llegó el carro (kilometraje, millas, gasolina y notas): lo que
// comparten «Llegó el carro», el paso «¿Cómo llegó el carro?» del asistente y
// la ficha.
// Kilómetros y millas son dos campos: al escribir uno, el otro se llena solo
// con la conversión, pero se puede corregir a mano (a veces el tablero no
// cuadra con la fórmula). `kmAMano`/`millasAMano` dicen cuál se escribió; el
// que no, se sigue calculando del otro.

export const LLEGADA_VACIA = {
  km: "",
  millas: "",
  kmAMano: false,
  millasAMano: false,
  sinKm: false,
  gasolina: null,
  notas: "",
};

export const TEXTO_GASOLINA = { vacio: "Vacío", "1/4": "1/4", "1/2": "1/2", "3/4": "3/4", lleno: "Lleno" };

const convertir = (texto, de, a) => {
  const n = soloDigitos(texto);
  return n ? String(convertirDistancia(Number(n), de, a)) : "";
};

// Lo que cambia al escribir en uno de los dos campos ("km" o "mi").
export function cambioLectura(valores, campo, texto) {
  const aMano = soloDigitos(texto) !== "";
  if (campo === "km") {
    return {
      km: texto,
      kmAMano: aMano,
      sinKm: false,
      ...(valores.millasAMano ? {} : { millas: convertir(texto, "km", "mi") }),
    };
  }
  return {
    millas: texto,
    millasAMano: aMano,
    sinKm: false,
    ...(valores.kmAMano ? {} : { km: convertir(texto, "mi", "km") }),
  };
}

// La lectura principal: la de kilómetros si se escribió (o se calculó); si
// solo se escribieron las millas, esas. `millas` va aparte solo cuando las dos
// se escribieron a mano. Así el trabajo guarda km_entrada + unidad_distancia
// como siempre, y millas_entrada cuando no cuadran con la fórmula.
export function lecturaLlegada(valores) {
  const km = soloDigitos(valores.km);
  const millas = soloDigitos(valores.millas);
  if (valores.millasAMano && !valores.kmAMano) {
    return millas ? { km: Number(millas), unidad: "mi", millas: null } : { km: null, unidad: "km", millas: null };
  }
  return {
    km: km ? Number(km) : null,
    unidad: "km",
    millas: valores.millasAMano && valores.kmAMano && millas ? Number(millas) : null,
  };
}

// La lectura del tablero como número, o null si está en blanco.
export const kmLlegada = (valores) => lecturaLlegada(valores).km;

// Ya se puede seguir: tiene la lectura o no se puede ver el tablero.
export const llegadaLista = (valores) => kmLlegada(valores) !== null || valores.sinKm;

// Lo que se guarda en el trabajo.
export const datosLlegada = (valores) => ({
  ...lecturaLlegada(valores),
  combustible: valores.gasolina,
  notas: valores.notas.trim() || null,
});
