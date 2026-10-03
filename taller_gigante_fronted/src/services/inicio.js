import { supabase } from "../lib/supabaseClient";

// "Para hoy" de Inicio: carros en el taller, esperando respuesta, listos y
// total por cobrar (resumen_inicio() respeta el rol: admin ve lo real; demo,
// lo demo), más las citas pendientes y cuántas son para hoy.
export async function obtenerResumenInicio() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const inicioManana = new Date(inicioHoy);
  inicioManana.setDate(inicioManana.getDate() + 1);

  const [resumen, citas, citasHoy] = await Promise.all([
    supabase.rpc("resumen_inicio"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "cita"),
    supabase
      .from("ordenes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "cita")
      .gte("fecha_cita", inicioHoy.toISOString())
      .lt("fecha_cita", inicioManana.toISOString()),
  ]);

  for (const r of [resumen, citas, citasHoy]) {
    if (r.error) throw r.error;
  }

  return { ...resumen.data, citas: citas.count ?? 0, citas_hoy: citasHoy.count ?? 0 };
}
