import { supabase } from "../lib/supabaseClient";
import { calcularEstadoDekra } from "../lib/dekra";

// "Para hoy" de Inicio: carros en el taller, esperando respuesta, listos y
// total por cobrar (resumen_inicio() respeta el rol: admin ve lo real; demo,
// lo demo), más las citas pendientes, cuántas son para hoy y los carros que
// tienen que pasar DEKRA.
export async function obtenerResumenInicio() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const inicioManana = new Date(inicioHoy);
  inicioManana.setDate(inicioManana.getDate() + 1);

  const [resumen, citas, citasHoy, vehiculos] = await Promise.all([
    supabase.rpc("resumen_inicio"),
    supabase.from("ordenes").select("id", { count: "exact", head: true }).eq("estado", "cita"),
    supabase
      .from("ordenes")
      .select("id", { count: "exact", head: true })
      .eq("estado", "cita")
      .gte("fecha_cita", inicioHoy.toISOString())
      .lt("fecha_cita", inicioManana.toISOString()),
    supabase
      .from("vehiculos")
      .select("id, placa, ultima_revision_tecnica, cliente:clientes ( id, nombre )")
      .not("id_cliente", "is", null),
  ]);

  for (const r of [resumen, citas, citasHoy, vehiculos]) {
    if (r.error) throw r.error;
  }

  // Carros de clientes a los que ya les toca DEKRA y no la han pasado, del
  // que vence primero al último.
  const dekra = vehiculos.data
    .map((v) => ({ ...v, estado: calcularEstadoDekra(v.placa, v.ultima_revision_tecnica) }))
    .filter((v) => v.estado?.dentroDeVentana)
    .sort((a, b) => a.estado.diasParaVencer - b.estado.diasParaVencer);

  return { ...resumen.data, citas: citas.count ?? 0, citas_hoy: citasHoy.count ?? 0, dekra };
}
