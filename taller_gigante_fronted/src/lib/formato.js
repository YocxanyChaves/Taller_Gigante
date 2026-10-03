// Formatos compartidos: plata, kilometraje y fechas de los formularios.

export const formatoColones = (valor) =>
  `₡${Number(valor).toLocaleString("es-CR", { maximumFractionDigits: 0 })}`;

export const formatoKm = (km) => `${Number(km).toLocaleString("es-CR")} km`;

// Un <input type="number"> vacío da "": en la base eso es null, no 0.
export const numeroONull = (valor) =>
  valor === "" || valor == null ? null : Number(valor);

// Solo los números de un texto ("8888-1111" → "88881111").
export const soloDigitos = (texto) => String(texto ?? "").replace(/\D/g, "");

// "dsf-456" → "DSF456" (misma regla que normalizar_placa() en la base).
export const normalizarPlaca = (placa) =>
  String(placa ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

// Teléfono de Costa Rica para mostrar: "8888 1111".
export function formatoTelefono(telefono) {
  const digitos = soloDigitos(telefono).slice(-8);
  return digitos.length === 8 ? `${digitos.slice(0, 4)} ${digitos.slice(4)}` : telefono ?? "";
}

// "Toyota Hilux 2012" con lo que haya; sin datos, "Carro sin marca".
export function nombreCarro(vehiculo) {
  const partes = [vehiculo?.marca, vehiculo?.modelo, vehiculo?.anio]
    .filter(Boolean)
    .map(String)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1));
  return partes.length ? partes.join(" ") : "Carro sin marca";
}

// Días completos desde una fecha hasta hoy (0 = hoy).
export function diasDesde(iso) {
  if (!iso) return 0;
  const inicio = new Date(iso);
  inicio.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((hoy - inicio) / 86400000));
}

// "hoy", "1 día", "5 días".
export function textoDias(dias) {
  if (dias === 0) return "hoy";
  return dias === 1 ? "1 día" : `${dias} días`;
}

// "sábado 26 de setiembre, 2:30 p. m." (en Costa Rica se dice "setiembre").
export function fechaLarga(iso, conHora = false) {
  if (!iso) return "";
  const opciones = { weekday: "long", day: "numeric", month: "long" };
  if (conHora) Object.assign(opciones, { hour: "numeric", minute: "2-digit" });
  return new Date(iso).toLocaleString("es-CR", opciones).replace("septiembre", "setiembre");
}

// "setiembre de 2026".
export function mesYAnio(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("es-CR", { month: "long", year: "numeric" }).replace("septiembre", "setiembre");
}

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
