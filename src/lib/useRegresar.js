import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// ¿Se puede "← Regresar" en esta pantalla? Solo en los detalles (un carro o
// un cliente) y solo si se llegó ahí desde otra pantalla de la app. Las
// secciones (Carros en el taller, Clientes, Cobros…) siempre vuelven a
// Inicio, así que regresando siempre se termina en un lugar conocido y nunca
// se sale de la app ni se queda sin nada atrás.
//
// Se recuerda de dónde se vino en cada paso del historial (por su `key`). Si
// se recarga la página se olvida, y entonces la flecha dice "Inicio".

const vinoDe = new Map(); // key del paso → pathname de la pantalla anterior
const ultima = { key: null, pathname: null }; // el último paso ya anotado

const esDetalle = (ruta) => /^\/(trabajos|clientes)\/[^/]+$/.test(ruta) && ruta !== "/trabajos/nuevo";

// De dónde se vino a este paso. Al pintar, `ultima` todavía es la pantalla
// anterior: el efecto de abajo la pone al día después.
function anteriorDe(key, tipo) {
  if (vinoDe.has(key)) return vinoDe.get(key);
  if (tipo === "PUSH") return ultima.pathname;
  if (tipo === "REPLACE") return vinoDe.get(ultima.key); // ocupa el mismo lugar
  return undefined;
}

export default function useRegresar() {
  const { key, pathname } = useLocation();
  const tipo = useNavigationType();
  const anterior = anteriorDe(key, tipo);

  useEffect(() => {
    vinoDe.set(key, anterior);
    ultima.key = key;
    ultima.pathname = pathname;
  }, [key, pathname, anterior]);

  // Del asistente de agregar un carro no se regresa: quedaría a medio llenar.
  return esDetalle(pathname) && !!anterior && anterior !== "/trabajos/nuevo";
}
