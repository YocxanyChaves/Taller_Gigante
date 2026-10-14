import { supabase } from "../lib/supabaseClient";
import { calcularEstadoDekra } from "../lib/dekra";

// "Para hoy" de Inicio: esperando respuesta, listos y total por cobrar
// (resumen_inicio() respeta el rol: admin ve lo real; demo, lo demo), más los
// carros que se están trabajando y los que esperan repuestos (cada carro con
// una sola luz: el "en_taller" de resumen_inicio() cuenta también los listos),
// las citas pendientes, cuántas son para hoy y los carros que tienen que
// pasar DEKRA.
export async function obtenerResumenInicio() {
  const inicioHoy = new Date();
  inicioHoy.setHours(0, 0, 0, 0);
  const inicioManana = new Date(inicioHoy);
  inicioManana.setDate(inicioManana.getDate() + 1);

  const [resumen, enTaller, citas, citasHoy, vehiculos] = await Promise.all([
    supabase.rpc("resumen_inicio"),
    supabase.from("ordenes").select("estado").in("estado", ["en_revision", "en_reparacion", "esperando_repuestos"]),
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

  for (const r of [resumen, enTaller, citas, citasHoy, vehiculos]) {
    if (r.error) throw r.error;
  }

  // Carros de clientes a los que ya les toca DEKRA y no la han pasado, del
  // que vence primero al último.
  const dekra = vehiculos.data
    .map((v) => ({ ...v, estado: calcularEstadoDekra(v.placa, v.ultima_revision_tecnica) }))
    .filter((v) => v.estado?.dentroDeVentana)
    .sort((a, b) => a.estado.diasParaVencer - b.estado.diasParaVencer);

  const cuantos = (...estados) => enTaller.data.filter((o) => estados.includes(o.estado)).length;

  return {
    ...resumen.data,
    trabajandose: cuantos("en_revision", "en_reparacion"),
    esperando_repuestos: cuantos("esperando_repuestos"),
    citas: citas.count ?? 0,
    citas_hoy: citasHoy.count ?? 0,
    dekra,
  };
}
