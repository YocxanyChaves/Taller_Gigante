import { supabase } from "../lib/supabaseClient";

// Consultas de "Buscar un cliente" y la ficha del cliente. RLS decide qué ve
// cada rol: admin, lo real; demo, lo de prueba.

// Por nombre, teléfono o placa. Sin texto, los clientes con movimiento más
// reciente (ver buscar_clientes() en la base).
export async function buscarClientes(texto) {
  const { data, error } = await supabase.rpc("buscar_clientes", { p_texto: texto || null });
  if (error) throw error;
  return data ?? [];
}

// El cliente con sus carros y, por carro, sus trabajos (el más nuevo primero)
// con total y saldo. null si no existe.
export async function obtenerCliente(id) {
  const { data, error } = await supabase
    .from("clientes")
    .select(
      `id, nombre, telefono, correo, direccion, fecha_ingreso,
       vehiculos ( id, placa, marca, modelo, anio, kilometraje,
         ordenes ( id, estado, problema_reportado, diagnostico, fecha_ingreso, fecha_cita, fecha_entrega ) )`
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const ids = data.vehiculos.flatMap((v) => v.ordenes.map((o) => o.id));
  let totales = [];
  if (ids.length) {
    const respuesta = await supabase.from("ordenes_totales").select("orden_id, total, saldo").in("orden_id", ids);
    if (respuesta.error) throw respuesta.error;
    totales = respuesta.data;
  }
  const porOrden = Object.fromEntries(totales.map((t) => [t.orden_id, t]));

  const vehiculos = data.vehiculos
    .map((v) => ({
      ...v,
      ordenes: v.ordenes
        .map((o) => ({ ...o, total: Number(porOrden[o.id]?.total ?? 0), saldo: Number(porOrden[o.id]?.saldo ?? 0) }))
        .sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)),
    }))
    // Primero el carro que vino más recientemente.
    .sort((a, b) => new Date(b.ordenes[0]?.fecha_ingreso ?? 0) - new Date(a.ordenes[0]?.fecha_ingreso ?? 0));

  // Lo que debe: saldo de lo ya entregado (lo mismo que "por cobrar").
  const debe = vehiculos
    .flatMap((v) => v.ordenes)
    .filter((o) => o.estado === "entregado" && o.saldo > 0)
    .reduce((suma, o) => suma + o.saldo, 0);

  return { ...data, vehiculos, debe };
}

export async function obtenerClienteBasico(id) {
  const { data, error } = await supabase.from("clientes").select("id, nombre, telefono").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function actualizarCliente(id, { nombre, telefono, correo, direccion }) {
  const { error } = await supabase
    .from("clientes")
    .update({
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim() || null,
      direccion: direccion.trim() || null,
    })
    .eq("id", id);
  if (error) throw error;
}
