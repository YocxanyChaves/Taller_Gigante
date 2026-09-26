// Formatos compartidos: plata, kilometraje y fechas de los formularios.

export const formatoColones = (valor) =>
  `₡${Number(valor).toLocaleString("es-CR", { maximumFractionDigits: 0 })}`;

export const formatoKm = (km) => `${Number(km).toLocaleString("es-CR")} km`;

// Un <input type="number"> vacío da "": en la base eso es null, no 0.
export const numeroONull = (valor) =>
  valor === "" || valor == null ? null : Number(valor);

// <input type="date"> da "AAAA-MM-DD". Se guarda como medianoche en hora
// local: si se mandara tal cual, Postgres lo tomaría como medianoche UTC y en
// Costa Rica se vería un día antes.
export function fechaInputAISO(fecha) {
  if (!fecha) return null;
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toISOString();
}

// Lo inverso: de un timestamp de la base a "AAAA-MM-DD" en hora local, para
// precargar un <input type="date">.
export function isoAFechaInput(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  const dosDigitos = (n) => String(n).padStart(2, "0");
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}
