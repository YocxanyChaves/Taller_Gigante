// Consultas y cálculos del Dashboard.

import { supabase } from "../lib/supabaseClient";
import { calcularEstadoDekra } from "../lib/dekra";
import { isoAFechaInput } from "../lib/formato";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Todo lo que muestra el Dashboard, en una sola ida a la base.
export async function cargarDatosDashboard() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const haceSieteDias = new Date();
  haceSieteDias.setDate(haceSieteDias.getDate() - 6);
  haceSieteDias.setHours(0, 0, 0, 0);

  const [
    { count: totalVehiculos },
    { count: totalClientes },
    { count: ordenesPendientes },
    { count: ordenesEnProceso },
    { data: ordenesDelMes },
    { data: ultimasOrdenes },
    { data: ordenesSemana },
    { data: ultimoCliente },
    { data: vehiculos },
  ] = await Promise.all([
    supabase.from("vehiculos").select("*", { count: "exact", head: true }),
    supabase.from("clientes").select("*", { count: "exact", head: true }),
    supabase
      .from("ordenes")
      .select("*", { count: "exact", head: true })
      .eq("estado", "Pendiente"),
    supabase
      .from("ordenes")
      .select("*", { count: "exact", head: true })
      .eq("estado", "En proceso"),
    supabase
      .from("ordenes")
      .select("costo_final, fecha_entrega")
      .gte("fecha_entrega", inicioMes.toISOString()),
    supabase
      .from("ordenes")
      .select("id, estado, fecha_ingreso, vehiculos(placa, marca, modelo, clientes(nombre))")
      .order("id", { ascending: false })
      .limit(5),
    supabase
      .from("ordenes")
      .select("id, fecha_ingreso")
      .gte("fecha_ingreso", haceSieteDias.toISOString()),
    supabase
      .from("clientes")
      .select("nombre, fecha_ingreso")
      .order("fecha_ingreso", { ascending: false })
      .limit(1),
    supabase
      .from("vehiculos")
      .select("id, placa, marca, modelo, ultima_revision_tecnica, clientes(nombre)"),
  ]);

  return {
    totalVehiculos: totalVehiculos ?? 0,
    totalClientes: totalClientes ?? 0,
    ordenesPendientes: ordenesPendientes ?? 0,
    ordenesEnProceso: ordenesEnProceso ?? 0,
    ordenesDelMes: ordenesDelMes || [],
    ultimasOrdenes: ultimasOrdenes || [],
    ordenesSemana: ordenesSemana || [],
    ultimoCliente: ultimoCliente?.[0] || null,
    vehiculos: vehiculos || [],
  };
}

export const sumarIngresos = (ordenes) =>
  ordenes.reduce((acc, o) => acc + Number(o.costo_final ?? 0), 0);

// Órdenes ingresadas por día en los últimos 7 días, de más viejo a hoy.
export function serieSemanal(ordenesSemana) {
  const conteoPorDia = {};
  ordenesSemana.forEach((o) => {
    const dia = DIAS[new Date(o.fecha_ingreso).getDay()];
    conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
  });

  const hoy = new Date();
  const serie = [];
  for (let i = 6; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    const dia = DIAS[fecha.getDay()];
    serie.push({ day: dia, orders: conteoPorDia[dia] || 0 });
  }
  return serie;
}

// Vehículos que están dentro de su ventana de revisión técnica, los más
// urgentes primero.
export function alertasDekra(vehiculos) {
  return vehiculos
    .map((v) => {
      const estado = calcularEstadoDekra(v.placa, v.ultima_revision_tecnica);
      return estado && estado.dentroDeVentana ? { ...v, ...estado } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.diasParaVencer - b.diasParaVencer);
}

// Identifica un conjunto de alertas: si aparece un vehículo nuevo, cambia y
// el aviso vuelve a mostrarse aunque se haya cerrado.
export const firmaDeAlertas = (alertas) =>
  alertas
    .map((a) => a.id)
    .sort((a, b) => a - b)
    .join(",");

// Guarda la fecha de hoy en hora local: con toISOString() sería la fecha UTC,
// que después de las 6 p. m. en Costa Rica ya es mañana.
export function marcarRevisionHecha(vehiculoId) {
  return supabase
    .from("vehiculos")
    .update({ ultima_revision_tecnica: isoAFechaInput(new Date()) })
    .eq("id", vehiculoId);
}
