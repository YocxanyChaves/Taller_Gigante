// Todas las consultas a Supabase de la página Clientes. Cada función devuelve
// lo mismo que Supabase ({ data, error }) para que la página decida qué mostrar.

import { supabase } from "../lib/supabaseClient";

export const soloDigitos = (texto) => (texto || "").replace(/\D/g, "");

// ===== Fichas =====

export function listarClientes() {
  return supabase
    .from("clientes")
    .select("*")
    .order("fecha_ingreso", { ascending: false });
}

// Crea una ficha nueva, o edita la que tenga ese id.
export function guardarCliente(datos, id = null) {
  return id
    ? supabase.from("clientes").update(datos).eq("id", id)
    : supabase.from("clientes").insert(datos);
}

export function cambiarBloqueo(clienteId, bloqueado) {
  return supabase.from("clientes").update({ bloqueado }).eq("id", clienteId);
}

// ===== Eliminar =====

export async function idsVehiculosDeCliente(clienteId) {
  const { data } = await supabase
    .from("vehiculos")
    .select("id")
    .eq("id_cliente", clienteId);
  return (data || []).map((v) => v.id);
}

export async function ordenesActivasDeVehiculos(vehiculoIds) {
  const { data } = await supabase
    .from("ordenes")
    .select("id, estado, descripcion, id_vehiculo, vehiculos(placa, marca, modelo)")
    .in("id_vehiculo", vehiculoIds)
    .in("estado", ["Pendiente", "En proceso"])
    .order("id");
  return data || [];
}

export function marcarOrdenCompletada(ordenId) {
  return supabase.from("ordenes").update({ estado: "Completado" }).eq("id", ordenId);
}

// modo: "todo" (borra vehículos y órdenes) o "conservar_historial".
// Ojo: también borra la cuenta de login del cliente, si tenía.
export function eliminarClienteCompleto(clienteId, modo) {
  return supabase.rpc("eliminar_cliente_completo", {
    p_cliente_id: clienteId,
    p_modo: modo,
  });
}

// ===== Vincular cuentas =====

// Todas las cuentas con rol cliente, estén o no vinculadas a otra ficha.
export function listarCuentasCliente() {
  return supabase
    .from("usuarios")
    .select("id, nombre, correo")
    .eq("rol", "cliente")
    .order("nombre");
}

// Vincula la cuenta a la ficha. Si la cuenta ya tenía otra ficha, la función
// de la base las fusiona (mueve los vehículos y borra la ficha vieja).
export async function vincularCuenta(clienteId, usuarioId) {
  const resultado = await supabase.rpc("fusionar_cliente_vinculado", {
    p_cliente_destino_id: clienteId,
    p_usuario_id: usuarioId,
  });
  if (resultado.error) return resultado;

  // Si esta cuenta tenía una solicitud pendiente, se resuelve sola para que
  // no quede huérfana en la bandeja de solicitudes.
  await supabase
    .from("solicitudes_vinculacion")
    .update({
      estado: "aprobada",
      cliente_id: clienteId,
      fecha_resolucion: new Date().toISOString(),
    })
    .eq("user_id", usuarioId)
    .eq("estado", "pendiente");

  return resultado;
}

// ===== Solicitudes de vinculación =====

export function listarSolicitudesPendientes() {
  return supabase
    .from("solicitudes_vinculacion")
    .select("*, usuarios(nombre, correo)")
    .eq("estado", "pendiente")
    .order("fecha_solicitud", { ascending: true });
}

// La ficha real a la que ya está vinculada esta cuenta, si hay.
export async function fichaVinculadaA(userId) {
  const { data } = await supabase
    .from("clientes")
    .select("id, nombre, telefono, correo")
    .eq("es_demo", false)
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// Fichas reales sin cuenta, con las que coinciden por teléfono de primeras.
export async function fichasSinVincular(telefonoSolicitud) {
  const { data } = await supabase
    .from("clientes")
    .select("id, nombre, telefono, correo")
    .eq("es_demo", false)
    .is("user_id", null)
    .order("nombre");

  const digitos = soloDigitos(telefonoSolicitud);
  return [...(data || [])].sort((a, b) => {
    const aCoincide = digitos && soloDigitos(a.telefono) === digitos;
    const bCoincide = digitos && soloDigitos(b.telefono) === digitos;
    if (aCoincide && !bCoincide) return -1;
    if (!aCoincide && bCoincide) return 1;
    return (a.nombre || "").localeCompare(b.nombre || "");
  });
}

export async function aprobarSolicitud(solicitud, clienteId) {
  const vinculo = await supabase
    .from("clientes")
    .update({ user_id: solicitud.user_id })
    .eq("id", clienteId);
  if (vinculo.error) return vinculo;

  return supabase
    .from("solicitudes_vinculacion")
    .update({
      estado: "aprobada",
      cliente_id: clienteId,
      fecha_resolucion: new Date().toISOString(),
    })
    .eq("id", solicitud.id);
}

export function rechazarSolicitud(solicitudId) {
  return supabase
    .from("solicitudes_vinculacion")
    .update({ estado: "rechazada", fecha_resolucion: new Date().toISOString() })
    .eq("id", solicitudId);
}
