// Consultas a Supabase del portal del cliente. Las políticas RLS se encargan
// de que cada cliente solo vea y toque lo suyo.

import { supabase } from "../lib/supabaseClient";
import { numeroONull } from "../lib/formato";

// La ficha del cliente con sesión iniciada, con sus vehículos y órdenes.
// Devuelve null si su cuenta todavía no está vinculada a ninguna ficha.
export async function cargarMiFicha() {
  const { data } = await supabase
    .from("clientes")
    .select(
      "id, nombre, telefono, correo, direccion, bloqueado, vehiculos(id, placa, marca, modelo, año, color, ordenes(id, estado, descripcion, diagnostico, costo_estimado, costo_final, fecha_ingreso, fecha_entrega))"
    )
    .maybeSingle();
  return data || null;
}

export function actualizarMisDatos(clienteId, datos) {
  return supabase.from("clientes").update(datos).eq("id", clienteId);
}

export function agregarVehiculo(clienteId, form) {
  return supabase.from("vehiculos").insert({
    id_cliente: clienteId,
    placa: form.placa.trim().toUpperCase(),
    marca: form.marca || null,
    modelo: form.modelo || null,
    año: numeroONull(form.año),
    color: form.color || null,
    kilometraje: numeroONull(form.kilometraje),
    ultima_revision_tecnica: form.ultima_revision_tecnica || null,
  });
}

// ===== Solicitud de vinculación (cuenta sin ficha) =====

export async function ultimaSolicitud(userId) {
  const { data } = await supabase
    .from("solicitudes_vinculacion")
    .select("*")
    .eq("user_id", userId)
    .order("fecha_solicitud", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data || null;
}

export function enviarSolicitud(userId, telefono) {
  return supabase.from("solicitudes_vinculacion").insert({
    user_id: userId,
    telefono_ingresado: telefono,
  });
}
