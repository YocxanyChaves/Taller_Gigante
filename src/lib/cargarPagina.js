import { lazy } from "react";

// lazy() que aguanta una mala conexión: si el pedazo de la página no baja,
// lo intenta de nuevo solo. Si sigue fallando (casi siempre porque se publicó
// una versión nueva y el pedazo viejo ya no existe), recarga la página una
// sola vez. Si ni así, deja pasar el error para que <SiFallaLaCarga> avise.

const CLAVE = "taller:recargo-por-carga";
const espera = (ms) => new Promise((r) => setTimeout(r, ms));

function leer() {
  try {
    return sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return true; // sin sessionStorage no hay cómo evitar recargas en bucle
  }
}

function guardar(valor) {
  try {
    if (valor) sessionStorage.setItem(CLAVE, "1");
    else sessionStorage.removeItem(CLAVE);
  } catch {
    // sin sessionStorage: no pasa nada
  }
}

export default function cargarPagina(importar, intentos = 3) {
  return lazy(async () => {
    for (let intento = 1; ; intento++) {
      try {
        const modulo = await importar();
        guardar(false);
        return modulo;
      } catch (error) {
        if (intento < intentos) {
          await espera(800 * intento);
          continue;
        }
        if (!leer()) {
          guardar(true);
          window.location.reload();
          return new Promise(() => {}); // la página se está recargando
        }
        throw error;
      }
    }
  });
}
