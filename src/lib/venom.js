// Ayuda del efecto venom (components/ui/Venom.jsx).

const centro = (el, z) => {
  const b = el.getBoundingClientRect();
  return { x: `${b.left + b.width / 2 - z.left}px`, y: `${b.top + b.height / 2 - z.top}px` };
};

// Pone el origen de la masa en el centro del `.venom-boton`, esté donde esté
// dentro de la zona. Si hay más puntos de donde sale el color (elementos con
// `.venom-origen`, como las placas), el 1.º, 2.º… se le ponen a la masa y la
// copia que lleven `origen={1}`, `origen={2}`… Va en onPointerEnter y onFocus
// del `.venom-activador`.
export function apuntarVenom(e) {
  const raiz = e.currentTarget;
  const zona = raiz.matches(".venom-zona") ? raiz : raiz.querySelector(".venom-zona");
  const boton = zona?.querySelector(".venom-boton");
  if (!zona || !boton) return;
  const z = zona.getBoundingClientRect();

  const principal = centro(boton, z);
  zona.style.setProperty("--venom-x", principal.x);
  zona.style.setProperty("--venom-y", principal.y);

  zona.querySelectorAll(".venom-origen").forEach((el, i) => {
    const { x, y } = centro(el, z);
    zona.querySelectorAll(`[data-origen="${i + 1}"]`).forEach((capa) => {
      capa.style.setProperty("--venom-x", x);
      capa.style.setProperty("--venom-y", y);
    });
  });
}
