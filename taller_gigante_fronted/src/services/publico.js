import { supabase } from "../lib/supabaseClient";

// Página del cliente (sin cuenta). Las dos funciones de la base son públicas a
// propósito y solo devuelven lo que el cliente necesita ver.

// null si el link no existe (o se cambió por uno nuevo).
export async function obtenerTrabajoPublico(token) {
  const { data, error } = await supabase.rpc("get_trabajo_publico", { p_token: token });
  // 22P02: el código del link está mal copiado (no es un uuid). Es lo mismo que no existir.
  if (error?.code === "22P02") return null;
  if (error) throw error;
  return data;
}

// "Sí, hágale" / "No, gracias". Si ya había respondido, no cambia nada.
export async function responderCotizacion(token, aprueba, comentario) {
  const { data, error } = await supabase.rpc("responder_cotizacion", {
    p_token: token,
    p_aprueba: aprueba,
    p_comentario: comentario || null,
  });
  if (error) throw error;
  return data;
}
