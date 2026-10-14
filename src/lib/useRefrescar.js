import { useEffect } from "react";

// Vuelve a cargar los datos solo: cada `cada` ms mientras la pantalla está
// a la vista, y cada vez que la persona regresa a esta pestaña. Así, si el
// cliente responde desde su link, el tío lo ve sin recargar la página.

export default function useRefrescar(recargar, cada = 30000) {
  useEffect(() => {
    const siEstaAVista = () => {
      if (document.visibilityState === "visible") recargar();
    };
    const intervalo = setInterval(siEstaAVista, cada);
    document.addEventListener("visibilitychange", siEstaAVista);
    window.addEventListener("focus", siEstaAVista);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", siEstaAVista);
      window.removeEventListener("focus", siEstaAVista);
    };
  }, [recargar, cada]);
}
