// Estados de un trabajo (columna `ordenes.estado`): el texto que ve el tío y
// su luz del semáforo. Mismos textos que `etiqueta_estado()` en la base.
//   verde    = listo para recoger
//   amarillo = el carro se está trabajando
//   rojo     = detenido, esperando algo (respuesta del cliente o repuestos)
//   null     = todavía no llega o ya terminó (semáforo apagado)

export const ESTADOS = {
  cita: { texto: "Cita agendada", luz: null },
  en_revision: { texto: "En revisión", luz: "amarillo" },
  esperando_aprobacion: { texto: "Esperando respuesta", luz: "rojo" },
  esperando_repuestos: { texto: "Esperando repuestos", luz: "rojo" },
  en_reparacion: { texto: "En reparación", luz: "amarillo" },
  listo: { texto: "Listo para recoger", luz: "verde" },
  no_aprobado: { texto: "No aprobó", luz: null },
  entregado: { texto: "Entregado", luz: null },
  cancelado: { texto: "Cancelado", luz: null },
};
