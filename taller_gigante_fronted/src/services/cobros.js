import { supabase } from "../lib/supabaseClient";

// Entregar, cobrar y abonos. Las reglas (no cobrar de más, de contado se paga
// todo) las revisa la base; aquí solo se llaman.

export const METODOS = [
  { valor: "efectivo", texto: "Efectivo" },
  { valor: "sinpe", texto: "SINPE Móvil" },
  { valor: "transferencia", texto: "Transferencia" },
];

export const textoMetodo = (valor) => METODOS.find((m) => m.valor === valor)?.texto ?? valor;

// Entrega el carro y anota el primer pago (si hay). Devuelve el saldo que queda.
export async function entregarTrabajo(ordenId, { modalidad, monto, metodo, cobroRevision, nota }) {
  const { data, error } = await supabase.rpc("entregar_trabajo", {
    p_orden_id: ordenId,
    p_modalidad: modalidad ?? null,
    p_monto: monto ?? 0,
    p_metodo: metodo ?? null,
    p_cobro_revision: cobroRevision ?? null,
    p_nota: nota ?? null,
  });
  if (error) throw error;
  return Number(data);
}

// Devuelve el saldo que queda.
export async function registrarAbono(ordenId, { monto, metodo, nota }) {
  const { data, error } = await supabase.rpc("registrar_abono", {
    p_orden_id: ordenId,
    p_monto: monto,
    p_metodo: metodo,
    p_nota: nota ?? null,
  });
  if (error) throw error;
  return Number(data);
}

// "Cobrar y entregar": quién debe y los carros que esperan que los recojan.
export async function obtenerCobros() {
  const [deudas, porEntregar] = await Promise.all([
    supabase.rpc("lista_cobros"),
    supabase
      .from("ordenes")
      .select(
        `id, estado, fecha_ingreso,
         vehiculo:vehiculos ( placa, marca, modelo, anio, cliente:clientes ( nombre ) )`
      )
      .in("estado", ["listo", "no_aprobado"])
      .order("fecha_ingreso"),
  ]);
  for (const r of [deudas, porEntregar]) {
    if (r.error) throw r.error;
  }

  let totales = [];
  if (porEntregar.data.length) {
    const respuesta = await supabase
      .from("ordenes_totales")
      .select("orden_id, total")
      .in(
        "orden_id",
        porEntregar.data.map((o) => o.id)
      );
    if (respuesta.error) throw respuesta.error;
    totales = respuesta.data;
  }
  const total = Object.fromEntries(totales.map((t) => [t.orden_id, Number(t.total)]));

  return {
    deudas: deudas.data.map((d) => ({ ...d, total: Number(d.total), saldo: Number(d.saldo) })),
    porEntregar: porEntregar.data.map((o) => ({ ...o, total: total[o.id] ?? 0 })),
  };
}
