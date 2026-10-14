// Copia un texto al portapapeles. Si el navegador no deja (sin https, por
// ejemplo al abrir desde el celular por la red de la casa), usa el método viejo.
export async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const bien = document.execCommand("copy");
    area.remove();
    return bien;
  }
}
