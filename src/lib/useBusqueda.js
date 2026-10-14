import { useEffect, useState } from "react";

// Busca mientras la persona escribe: espera `espera` ms desde la última tecla
// y llama a `buscar(clave)`. `clave` null = no hay nada que buscar todavía.
// Devuelve { estado, resultado }, con estado "vacio" | "buscando" | "listo" | "error".
// Solo cuenta la respuesta de la última clave (si llega una vieja, se ignora).

export default function useBusqueda(clave, buscar, espera = 400) {
  const [respuesta, setRespuesta] = useState({ clave: null, estado: "vacio", resultado: null });

  useEffect(() => {
    if (clave == null) return;
    let vigente = true;
    const temporizador = setTimeout(() => {
      buscar(clave)
        .then((resultado) => vigente && setRespuesta({ clave, estado: "listo", resultado }))
        .catch(() => vigente && setRespuesta({ clave, estado: "error", resultado: null }));
    }, espera);
    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [clave, buscar, espera]);

  if (clave == null) return { estado: "vacio", resultado: null };
  if (respuesta.clave !== clave) return { estado: "buscando", resultado: null };
  return respuesta;
}
