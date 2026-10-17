import { supabase } from "../lib/supabaseClient";

// Fotos de evidencia de cada trabajo. Los archivos van al depósito privado
// `fotos` en `<id del trabajo>/<algo al azar>.jpg`; la tabla `orden_fotos`
// guarda la lista con su nota. Para verlas se piden direcciones que vencen.

const DEPOSITO = "fotos";
const LADO_MAXIMO = 1600; // px: se ve bien en cualquier pantalla y pesa ~250 KB
const UNA_HORA = 60 * 60;

// Achica la foto en el celular antes de subirla (una de cámara pesa 3-5 MB) y
// la pasa a JPG, también si viene como HEIC o PNG.
async function achicar(archivo) {
  const imagen = await createImageBitmap(archivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d").drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo leer la foto. Pruebe con otra."))),
      "image/jpeg",
      0.8
    )
  );
}

// Las fotos de un trabajo, de la más vieja a la más nueva, con su dirección.
export async function listarFotos(ordenId) {
  const { data, error } = await supabase
    .from("orden_fotos")
    .select("id, ruta, nota, created_at")
    .eq("orden_id", ordenId)
    .order("created_at");
  if (error) throw error;
  if (!data.length) return [];

  const { data: firmadas, error: errorFirmar } = await supabase.storage
    .from(DEPOSITO)
    .createSignedUrls(
      data.map((f) => f.ruta),
      UNA_HORA
    );
  if (errorFirmar) throw errorFirmar;

  const url = Object.fromEntries(firmadas.map((f) => [f.path, f.signedUrl]));
  return data.map((f) => ({ ...f, url: url[f.ruta] }));
}

// Sube una foto con su nota (opcional). Si no se puede anotar (por ejemplo,
// ya hay 12), borra el archivo para que no quede suelto.
export async function subirFoto(ordenId, archivo, nota) {
  const foto = await achicar(archivo);
  const ruta = `${ordenId}/${crypto.randomUUID()}.jpg`;

  const { error: errorSubir } = await supabase.storage
    .from(DEPOSITO)
    .upload(ruta, foto, { contentType: "image/jpeg" });
  if (errorSubir) throw errorSubir;

  const { error } = await supabase.from("orden_fotos").insert({ orden_id: ordenId, ruta, nota: nota?.trim() || null });
  if (error) {
    await supabase.storage.from(DEPOSITO).remove([ruta]);
    throw error;
  }
}

export async function borrarFoto(foto) {
  const { error } = await supabase.from("orden_fotos").delete().eq("id", foto.id);
  if (error) throw error;
  await supabase.storage.from(DEPOSITO).remove([foto.ruta]);
}

// Página del cliente (sin cuenta): la función `fotos-cliente` revisa el link
// y devuelve las fotos con direcciones que vencen en 1 hora.
export async function fotosDelLink(token) {
  const { data, error } = await supabase.functions.invoke("fotos-cliente", { body: { token } });
  if (error) throw error;
  return data?.fotos ?? [];
}
