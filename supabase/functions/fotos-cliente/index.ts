// Fotos y videos para la página del cliente (sin cuenta). Recibe el código del link,
// revisa que siga vigente (igual que get_trabajo_publico: vence al entregar el
// carro sin deber nada) y devuelve las fotos y videos con direcciones que vencen en 1
// hora. El depósito `fotos` es privado: esta es la única puerta sin login.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNA_HORA = 60 * 60;

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return responder({ error: "Método no permitido" }, 405);

  const { token } = await req.json().catch(() => ({}));
  if (typeof token !== "string" || !UUID.test(token)) return responder({ fotos: [] });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: orden, error } = await supabase
    .from("ordenes")
    .select("id, estado")
    .eq("token_publico", token)
    .maybeSingle();
  if (error) return responder({ error: "No se pudieron cargar las fotos" }, 500);
  if (!orden) return responder({ fotos: [] });

  if (orden.estado === "entregado") {
    const { data: totales } = await supabase.from("ordenes_totales").select("saldo").eq("orden_id", orden.id).maybeSingle();
    if (Number(totales?.saldo ?? 0) <= 0) return responder({ fotos: [] });
  }

  const { data: fotos, error: errorFotos } = await supabase
    .from("orden_fotos")
    .select("ruta, nota, tipo, created_at")
    .eq("orden_id", orden.id)
    .order("created_at");
  if (errorFotos) return responder({ error: "No se pudieron cargar las fotos" }, 500);
  if (!fotos.length) return responder({ fotos: [] });

  const { data: firmadas, error: errorFirmar } = await supabase.storage
    .from("fotos")
    .createSignedUrls(
      fotos.map((f) => f.ruta),
      UNA_HORA
    );
  if (errorFirmar) return responder({ error: "No se pudieron cargar las fotos" }, 500);

  const url = Object.fromEntries(firmadas.map((f) => [f.path, f.signedUrl]));
  return responder({
    fotos: fotos.filter((f) => url[f.ruta]).map((f) => ({ url: url[f.ruta], nota: f.nota, tipo: f.tipo, fecha: f.created_at })),
  });
});
