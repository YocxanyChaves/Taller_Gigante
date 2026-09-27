import { supabase } from "../lib/supabaseClient";

// Consultas de los trabajos (tabla `ordenes`). RLS decide qué ve cada rol:
// admin, lo real; demo, lo de prueba.

const CAMPOS_TRABAJO = `
  id, estado, problema_reportado, diagnostico, fecha_ingreso, fecha_cita, fecha_entrega,
  km_entrada, nivel_combustible, notas_recepcion, aprobada, respondida_en, comentario_cliente,
  vehiculo:vehiculos ( id, placa, marca, modelo, anio, kilometraje,
    cliente:clientes ( id, nombre, telefono ) )
`;

// ===== Recibir un carro =====

export async function buscarVehiculoPorPlaca(placa) {
  const { data, error } = await supabase.rpc("buscar_vehiculo_por_placa", { p_placa: placa });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function buscarClientesPorTelefono(telefono) {
  const { data, error } = await supabase.rpc("buscar_cliente_por_telefono", { p_telefono: telefono });
  if (error) throw error;
  return data ?? [];
}

// Guarda cliente, carro y trabajo de una vez. Devuelve el id del trabajo.
export async function recibirCarro(datos) {
  const { data, error } = await supabase.rpc("recibir_carro", {
    p_problema: datos.problema,
    p_ya_esta: datos.yaEsta,
    p_fecha_cita: datos.fechaCita ?? null,
    p_vehiculo_id: datos.vehiculoId ?? null,
    p_placa: datos.placa ?? null,
    p_marca: datos.marca ?? null,
    p_modelo: datos.modelo ?? null,
    p_anio: datos.anio ?? null,
    p_cliente_id: datos.clienteId ?? null,
    p_cliente_nombre: datos.clienteNombre ?? null,
    p_cliente_telefono: datos.clienteTelefono ?? null,
  });
  if (error) throw error;
  return data;
}

// ===== Lista de carros en el taller =====

// Los trabajos sin terminar, con la fecha en que entraron a su etapa actual.
export async function listarTrabajosActivos() {
  const { data, error } = await supabase
    .from("ordenes")
    .select(CAMPOS_TRABAJO)
    .not("estado", "in", "(entregado,cancelado)")
    .order("fecha_ingreso", { ascending: false });
  if (error) throw error;
  if (!data.length) return [];

  const { data: historial, error: errorHistorial } = await supabase
    .from("orden_estados_historial")
    .select("orden_id, estado, created_at")
    .in(
      "orden_id",
      data.map((t) => t.id)
    )
    .order("created_at", { ascending: false });
  if (errorHistorial) throw errorHistorial;

  // El cambio más reciente de cada trabajo es cuando entró a su etapa actual.
  const desde = {};
  for (const h of historial) {
    if (!desde[h.orden_id]) desde[h.orden_id] = h.created_at;
  }

  return data.map((t) => ({ ...t, enEtapaDesde: desde[t.id] ?? t.fecha_ingreso }));
}

// ===== Ficha de un trabajo =====

export async function obtenerTrabajo(id) {
  const [trabajo, items, historial, totales] = await Promise.all([
    supabase.from("ordenes").select(CAMPOS_TRABAJO).eq("id", id).maybeSingle(),
    supabase.from("orden_items").select("*").eq("orden_id", id).order("id"),
    supabase.from("orden_estados_historial").select("*").eq("orden_id", id).order("created_at"),
    supabase.from("ordenes_totales").select("*").eq("orden_id", id).maybeSingle(),
  ]);

  for (const r of [trabajo, items, historial, totales]) {
    if (r.error) throw r.error;
  }
  if (!trabajo.data) return null;

  return {
    ...trabajo.data,
    items: items.data,
    historial: historial.data,
    totales: totales.data,
  };
}

export async function avanzarEstado(id, estado) {
  const { error } = await supabase.rpc("avanzar_estado", { p_orden_id: id, p_nuevo_estado: estado });
  if (error) throw error;
}

// "Ya llegó el carro": guarda la recepción (todo opcional) y pasa a revisión.
// Si el kilometraje es mayor que el que tenía el carro, también lo actualiza.
export async function registrarLlegada(trabajo, { km, combustible, notas }) {
  const { error } = await supabase
    .from("ordenes")
    .update({ km_entrada: km, nivel_combustible: combustible, notas_recepcion: notas })
    .eq("id", trabajo.id);
  if (error) throw error;

  if (km != null && km > (trabajo.vehiculo?.kilometraje ?? 0)) {
    const { error: errorKm } = await supabase
      .from("vehiculos")
      .update({ kilometraje: km })
      .eq("id", trabajo.vehiculo.id);
    if (errorKm) throw errorKm;
  }

  await avanzarEstado(trabajo.id, "en_revision");
}

// Guarda el diagnóstico y las filas del precio: borra las que se quitaron,
// actualiza las que ya existían y agrega las nuevas.
export async function guardarCotizacion(ordenId, diagnostico, filas, filasAntes) {
  const { error: errorDiagnostico } = await supabase
    .from("ordenes")
    .update({ diagnostico: diagnostico.trim() || null })
    .eq("id", ordenId);
  if (errorDiagnostico) throw errorDiagnostico;

  const idsQuedan = new Set(filas.filter((f) => f.id).map((f) => f.id));
  const quitar = filasAntes.filter((f) => !idsQuedan.has(f.id)).map((f) => f.id);
  if (quitar.length) {
    const { error } = await supabase.from("orden_items").delete().in("id", quitar);
    if (error) throw error;
  }

  const aDatos = (f) => ({
    tipo: f.tipo,
    descripcion: f.descripcion.trim(),
    cantidad: f.cantidad,
    precio_unitario: f.precio,
    costo_unitario: f.tipo === "repuesto" ? f.costo : null,
  });

  for (const f of filas.filter((f) => f.id)) {
    const { error } = await supabase.from("orden_items").update(aDatos(f)).eq("id", f.id);
    if (error) throw error;
  }

  const nuevas = filas.filter((f) => !f.id).map((f) => ({ ...aDatos(f), orden_id: ordenId }));
  if (nuevas.length) {
    const { error } = await supabase.from("orden_items").insert(nuevas);
    if (error) throw error;
  }
}
