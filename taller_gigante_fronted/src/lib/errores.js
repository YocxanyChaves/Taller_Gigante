// Traduce errores de Supabase a mensajes entendibles para la persona.

export function mensajeError(error) {
  if (error?.code === "23505" && error.message?.includes("vehiculos_placa_unica")) {
    return "Ya existe un vehículo con esa placa.";
  }
  return error?.message || "Ocurrió un error inesperado.";
}
