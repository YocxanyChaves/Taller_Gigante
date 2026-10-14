// Lógica de la revisión técnica vehicular en Costa Rica (antes RITEVE, hoy a
// cargo de DEKRA). Cada vehículo tiene un mes fijo del año para pasar la
// revisión, según el último dígito de la placa:
//
//   1 y 6 -> enero y julio
//   2 y 7 -> febrero y agosto
//   3 y 8 -> marzo y septiembre
//   4 y 9 -> abril y octubre
//   5 y 0 -> mayo y noviembre
//
// El dueño puede hacerla desde un mes antes. Aquí usamos una ventana de
// aviso de 15 días antes de que inicie el mes asignado, hasta el último día
// de ese mes (que es el límite real para tenerla al día).

export const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "setiembre", // así se dice en Costa Rica
  "octubre",
  "noviembre",
  "diciembre",
];

const MES_POR_DIGITO = {
  "1": 1,
  "6": 7,
  "2": 2,
  "7": 8,
  "3": 3,
  "8": 9,
  "4": 4,
  "9": 10,
  "5": 5,
  "0": 11,
};

export function ultimoDigito(placa) {
  const digitos = String(placa || "").match(/\d/g);
  if (!digitos || digitos.length === 0) return null;
  return digitos[digitos.length - 1];
}

// Devuelve el mes asignado (1-12) según el último dígito de la placa, o null
// si la placa no tiene dígitos (formato no reconocido).
export function mesAsignadoDekra(placa) {
  const digito = ultimoDigito(placa);
  if (digito === null) return null;
  return MES_POR_DIGITO[digito] ?? null;
}

// Calcula el estado de la revisión técnica de un vehículo para una fecha de
// referencia dada (por defecto, hoy). Devuelve null si la placa no tiene un
// mes asignado reconocible.
export function calcularEstadoDekra(placa, ultimaRevision, hoy = new Date()) {
  const mes = mesAsignadoDekra(placa);
  if (!mes) return null;

  const mesIndex = mes - 1; // Date usa meses 0-11
  const construirVentana = (anio) => {
    const inicio = new Date(anio, mesIndex - 1, 15);
    const fin = new Date(anio, mesIndex + 1, 0, 23, 59, 59, 999);
    return { inicio, fin };
  };

  let { inicio, fin } = construirVentana(hoy.getFullYear());

  // Si ya pasó la ventana de este año, la próxima relevante es la del año
  // siguiente.
  if (hoy > fin) {
    ({ inicio, fin } = construirVentana(hoy.getFullYear() + 1));
  }

  // Una revisión solo cuenta como "ya hecha" si de verdad ya ocurrió. Si
  // alguien guardó una fecha futura por error (o como un recordatorio de
  // una cita agendada), todavía no cuenta como completada y la alerta debe
  // seguir activa hasta que la fecha ya haya pasado.
  const yaHechaEsteCiclo =
    ultimaRevision &&
    new Date(ultimaRevision) >= inicio &&
    new Date(ultimaRevision) <= hoy;

  const dentroDeVentana = hoy >= inicio && hoy <= fin && !yaHechaEsteCiclo;

  const msPorDia = 1000 * 60 * 60 * 24;
  const diasParaVencer = Math.ceil((fin - hoy) / msPorDia);

  return {
    mes,
    nombreMes: MESES[mesIndex],
    inicioVentana: inicio,
    finVentana: fin,
    dentroDeVentana,
    diasParaVencer,
  };
}
