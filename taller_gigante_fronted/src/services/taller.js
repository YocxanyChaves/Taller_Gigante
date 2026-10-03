import { supabase } from "../lib/supabaseClient";

// "Cómo va el taller": la plata por mes (resumen_plata() en la base) y
// cuántos carros hay por etapa y cuántos entraron y salieron este mes. RLS
// decide qué ve cada rol: admin, lo real; demo, lo de prueba.

// "AAAA-MM-DD" en hora local (resumen_plata recibe fechas, no horas).
const fechaLocal = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// rango: "6meses" (este mes y los 5 anteriores) o "anio" (desde enero).
export async function obtenerPlata(rango) {
  const hoy = new Date();
  const desde = rango === "anio" ? new Date(hoy.getFullYear(), 0, 1) : new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1);
  const { data, error } = await supabase.rpc("resumen_plata", { p_desde: fechaLocal(desde), p_hasta: fechaLocal(hoy) });
  if (error) throw error;
  return data.map((m) => ({
    mes: m.mes,
    cobrado: Number(m.cobrado),
    porCobrar: Number(m.por_cobrar),
    ganancia: Number(m.ganancia),
    aproximada: m.ganancia_aproximada,
  }));
}

export async function obtenerResumenTaller() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const [resumen, activos, recibidos, entregados] = await Promise.all([
    supabase.rpc("resumen_inicio"),
    supabase.from("ordenes").select("estado").not("estado", "in", "(entregado,cancelado)"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).gte("fecha_ingreso", inicioMes.toISOString()),
    supabase
      .from("ordenes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "entregado")
      .gte("fecha_entrega", inicioMes.toISOString()),
  ]);
  for (const r of [resumen, activos, recibidos, entregados]) {
    if (r.error) throw r.error;
  }

  const porEstado = {};
  for (const { estado } of activos.data) porEstado[estado] = (porEstado[estado] ?? 0) + 1;

  return {
    porCobrar: Number(resumen.data.por_cobrar),
    porEstado,
    recibidosMes: recibidos.count ?? 0,
    entregadosMes: entregados.count ?? 0,
  };
}
