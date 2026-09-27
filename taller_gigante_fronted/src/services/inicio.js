import { supabase } from "../lib/supabaseClient";

// Tarjetas de Inicio: carros en el taller, esperando respuesta, listos y
// total por cobrar. La función respeta el rol (admin ve lo real; demo, lo demo).
export async function obtenerResumenInicio() {
  const { data, error } = await supabase.rpc("resumen_inicio");
  if (error) throw error;
  return data;
}
