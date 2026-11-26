// Ayuda del efecto venom (components/ui/Venom.jsx).

// Pone el origen de la masa en el centro del `.venom-boton`, esté donde esté
// dentro de la zona. Va en onPointerEnter y onFocus del `.venom-activador`.
export function apuntarVenom(e) {
  const raiz = e.currentTarget;
  const zona = raiz.matches(".venom-zona") ? raiz : raiz.querySelector(".venom-zona");
  const boton = zona?.querySelector(".venom-boton");
  if (!zona || !boton) return;
  const z = zona.getBoundingClientRect();
  const b = boton.getBoundingClientRect();
  zona.style.setProperty("--venom-x", `${b.left + b.width / 2 - z.left}px`);
  zona.style.setProperty("--venom-y", `${b.top + b.height / 2 - z.top}px`);
}
