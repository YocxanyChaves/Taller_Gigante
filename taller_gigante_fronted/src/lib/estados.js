// Estados de un trabajo (columna `ordenes.estado`): el texto que ve el tío y
// el tono de su insignia. Mismos textos que `etiqueta_estado()` en la base.
//   azul  = el carro está en proceso
//   rojo  = hay que hacer algo (esperando respuesta del cliente)
//   cromo = listo para recoger
//   acero = terminado

export const ESTADOS = {
  cita: { texto: "Cita agendada", tono: "azul" },
  en_revision: { texto: "En revisión", tono: "azul" },
  esperando_aprobacion: { texto: "Esperando respuesta", tono: "rojo" },
  no_aprobado: { texto: "No aprobó", tono: "acero" },
  esperando_repuestos: { texto: "Esperando repuestos", tono: "azul" },
  en_reparacion: { texto: "En reparación", tono: "azul" },
  listo: { texto: "Listo para recoger", tono: "cromo" },
  entregado: { texto: "Entregado", tono: "acero" },
  cancelado: { texto: "Cancelado", tono: "acero" },
};
