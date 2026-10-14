import { useEffect, useState } from "react";

// Cuenta de 0 hasta `valor` en `duracion` ms (para que los números "suban"
// al abrir la pantalla). Si la persona pidió menos movimiento, va directo.

export default function useContar(valor, duracion = 900) {
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const reducir = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducir || !valor) {
      const id = requestAnimationFrame(() => setActual(valor));
      return () => cancelAnimationFrame(id);
    }

    let inicio = null;
    let id;
    const paso = (t) => {
      if (inicio === null) inicio = t;
      const avance = Math.min((t - inicio) / duracion, 1);
      const suave = 1 - Math.pow(1 - avance, 3);
      setActual(Math.round(valor * suave));
      if (avance < 1) id = requestAnimationFrame(paso);
    };
    id = requestAnimationFrame(paso);
    // Respaldo: si el navegador no está dibujando cuadros (pestaña de fondo),
    // el número correcto llega igual al terminar el tiempo.
    const respaldo = setTimeout(() => setActual(valor), duracion + 100);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(respaldo);
    };
  }, [valor, duracion]);

  return actual;
}
