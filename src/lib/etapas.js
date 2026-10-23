// Las fotos de cada etapa por la que pasó el carro. Cada cambio de estado
// queda anotado con su hora (orden_estados_historial), así que una foto es de
// la etapa en que estaba el carro cuando se tomó. Si el carro volvió a una
// etapa, cada vez cuenta aparte.
//
// historial: [{ estado, fecha }] del más viejo al más nuevo.
// fotos: [{ fecha, ... }].
// Devuelve el historial con `fotos` en cada etapa.
export function fotosPorEtapa(historial, fotos) {
  const etapas = historial.map((h) => ({ ...h, fotos: [] }));
  if (!etapas.length) return etapas;

  for (const foto of fotos) {
    const momento = new Date(foto.fecha);
    // La última etapa que empezó antes de la foto (la primera, si la foto es
    // de antes de cualquier cambio).
    let i = etapas.length - 1;
    while (i > 0 && new Date(etapas[i].fecha) > momento) i--;
    etapas[i].fotos.push(foto);
  }
  return etapas;
}

// "1 foto", "3 fotos y 1 video", "2 videos" (cada una con `tipo`).
export function textoFotos(lista) {
  const videos = lista.filter((f) => f.tipo === "video").length;
  const fotos = lista.length - videos;
  return [
    fotos > 0 && (fotos === 1 ? "1 foto" : `${fotos} fotos`),
    videos > 0 && (videos === 1 ? "1 video" : `${videos} videos`),
  ]
    .filter(Boolean)
    .join(" y ");
}
