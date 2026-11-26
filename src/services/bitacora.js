import { supabase } from "../lib/supabaseClient";

// La bitácora (tabla `bitacora`): solo se lee. La llenan solos los triggers de
// la base; RLS decide qué ve cada rol (admin, lo real; demo, lo de prueba).

export const POR_PAGINA = 40;

// Los renglones más nuevos primero. `tablas` filtra por tipo de cambio,
// `ordenId` por trabajo; `pagina` empieza en 0.
export async function listarBitacora({ tablas = null, ordenId = null, pagina = 0 } = {}) {
  let consulta = supabase
    .from("bitacora")
    .select("id, creado_en, quien, tabla, accion, orden_id, cliente_id, que, cambios")
    .order("creado_en", { ascending: false })
    .order("id", { ascending: false })
    .range(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA - 1);
  if (tablas) consulta = consulta.in("tabla", tablas);
  if (ordenId) consulta = consulta.eq("orden_id", ordenId);
  const { data, error } = await consulta;
  if (error) throw error;
  return data;
}
