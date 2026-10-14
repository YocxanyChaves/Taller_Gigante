// Traduce errores de Supabase a mensajes entendibles para la persona.

export function mensajeError(error) {
  if (error?.code === "23505" && error.message?.includes("vehiculos_placa_unica")) {
    return "Ya existe un vehículo con esa placa.";
  }
  const mensaje = error?.message ?? "";
  if (mensaje.includes("Failed to fetch") || mensaje.includes("NetworkError")) {
    return "No hay conexión con el sistema. Revise el internet e intente de nuevo.";
  }
  if (error?.code === "42501") {
    return "No tiene permiso para hacer esto.";
  }
  // Los mensajes que escribimos en la base ya vienen en español claro.
  return mensaje || "Ocurrió un error inesperado. Intente de nuevo.";
}
