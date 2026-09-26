// Consultas a Supabase de la página Vehículos.

import { supabase } from "../lib/supabaseClient";
import { numeroONull } from "../lib/formato";

export function listarVehiculos() {
  return supabase
    .from("vehiculos")
    .select("*, clientes(id, nombre)")
    .order("id", { ascending: false });
}

// Para el selector de dueño en el formulario.
export function listarClientesParaSelector() {
  return supabase.from("clientes").select("id, nombre").order("nombre", { ascending: true });
}

// Crea un vehículo, o edita el que tenga ese id. `form` son los valores
// tal como salen del formulario (texto).
export function guardarVehiculo(form, id = null) {
  const datos = {
    id_cliente: form.id_cliente ? Number(form.id_cliente) : null,
    placa: form.placa,
    marca: form.marca,
    modelo: form.modelo,
    año: numeroONull(form.año),
    color: form.color,
    kilometraje: numeroONull(form.kilometraje),
    ultima_revision_tecnica: form.ultima_revision_tecnica || null,
  };

  return id
    ? supabase.from("vehiculos").update(datos).eq("id", id)
    : supabase.from("vehiculos").insert(datos);
}

export function eliminarVehiculo(id) {
  return supabase.from("vehiculos").delete().eq("id", id);
}
