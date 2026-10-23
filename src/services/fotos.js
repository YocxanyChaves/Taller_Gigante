import { supabase } from "../lib/supabaseClient";

// Fotos y videos de evidencia de cada trabajo. Los archivos van al depósito
// privado `fotos` en `<id del trabajo>/<algo al azar>.<jpg|mp4|mov|webm>`; la
// tabla `orden_fotos` guarda la lista con su nota y si es foto o video. Para
// verlos se piden direcciones que vencen.

const DEPOSITO = "fotos";
const LADO_MAXIMO = 1600; // px: se ve bien en cualquier pantalla y pesa ~250 KB
const UNA_HORA = 60 * 60;

// Los videos no se pueden achicar en el celular: se suben tal cual, hasta
// 50 MB (más o menos 30 segundos en un celular normal).
export const VIDEO_MB_MAXIMO = 50;
const EXTENSION_VIDEO = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

export const esVideo = (archivo) => archivo.type?.startsWith("video/");

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

// Las fotos de un trabajo, de la más vieja a la más nueva, con su fecha y su
// dirección (vence en 1 hora).
export async function listarFotos(ordenId) {
  const { data, error } = await supabase
    .from("orden_fotos")
    .select("id, ruta, nota, tipo, created_at")
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
  return data.map((f) => ({ ...f, fecha: f.created_at, url: url[f.ruta] }));
}

// Prepara un video para subirlo: revisa el formato y el tamaño.
function prepararVideo(archivo) {
  const extension = EXTENSION_VIDEO[archivo.type];
  if (!extension) {
    throw new Error("Ese video no se puede subir. Grábelo con la cámara del celular (MP4 o MOV).");
  }
  if (archivo.size > VIDEO_MB_MAXIMO * 1024 * 1024) {
    const mb = Math.round(archivo.size / 1024 / 1024);
    throw new Error(`El video pesa ${mb} MB y el máximo es ${VIDEO_MB_MAXIMO} MB. Grabe uno más corto (unos 30 segundos).`);
  }
  return { cuerpo: archivo, extension, tipoArchivo: archivo.type };
}

// Sube una foto o un video con su nota (opcional). Si no se puede anotar (por
// ejemplo, ya hay 12), borra el archivo para que no quede suelto.
export async function subirFoto(ordenId, archivo, nota) {
  const video = esVideo(archivo);
  const { cuerpo, extension, tipoArchivo } = video
    ? prepararVideo(archivo)
    : { cuerpo: await achicar(archivo), extension: "jpg", tipoArchivo: "image/jpeg" };
  const ruta = `${ordenId}/${crypto.randomUUID()}.${extension}`;

  const { error: errorSubir } = await supabase.storage
    .from(DEPOSITO)
    .upload(ruta, cuerpo, { contentType: tipoArchivo });
  if (errorSubir) throw errorSubir;

  const { error } = await supabase
    .from("orden_fotos")
    .insert({ orden_id: ordenId, ruta, nota: nota?.trim() || null, tipo: video ? "video" : "foto" });
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

export async function borrarArchivosDeFotos(rutas) {
  if (!rutas.length) return;
  const { error } = await supabase.storage.from(DEPOSITO).remove(rutas);
  if (error) throw error;
}

// Página del cliente (sin cuenta): la función `fotos-cliente` revisa el link
// y devuelve las fotos con direcciones que vencen en 1 hora.
export async function fotosDelLink(token) {
  const { data, error } = await supabase.functions.invoke("fotos-cliente", { body: { token } });
  if (error) throw error;
  return data?.fotos ?? [];
}
