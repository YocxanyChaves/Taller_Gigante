// Consultas a Supabase de la página Órdenes.

import { supabase } from "../lib/supabaseClient";
import { numeroONull, fechaInputAISO } from "../lib/formato";

export const ESTADOS = ["Pendiente", "En proceso", "Completado"];

export function listarOrdenes() {
  return supabase
    .from("ordenes")
    .select("*, vehiculos(id, placa, marca, modelo, clientes(id, nombre))")
    .order("id", { ascending: false });
}

// Para el selector de vehículo en el formulario.
export function listarVehiculosParaSelector() {
  return supabase
    .from("vehiculos")
    .select("id, placa, marca, modelo, clientes(nombre)")
    .order("placa", { ascending: true });
}

// Crea una orden, o edita la que tenga ese id. `form` son los valores tal
// como salen del formulario (texto).
export function guardarOrden(form, id = null) {
  const datos = {
    id_vehiculo: form.id_vehiculo ? Number(form.id_vehiculo) : null,
    descripcion: form.descripcion,
    diagnostico: form.diagnostico,
    estado: form.estado,
    costo_estimado: numeroONull(form.costo_estimado),
    costo_final: numeroONull(form.costo_final),
    fecha_entrega: fechaInputAISO(form.fecha_entrega),
  };

  return id
    ? supabase.from("ordenes").update(datos).eq("id", id)
    : supabase.from("ordenes").insert(datos);
}

export function eliminarOrden(id) {
  return supabase.from("ordenes").delete().eq("id", id);
}
