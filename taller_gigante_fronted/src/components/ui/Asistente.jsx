import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Boton from "./Boton";

// Formulario de una pregunta por pantalla, con "Paso 2 de 4" y una barra
// roja que se va llenando. Cada paso entra deslizándose (desde la derecha al
// avanzar, desde la izquierda al volver). Es controlado: la pantalla que lo
// usa guarda el paso y las respuestas, así que "Atrás" nunca borra lo escrito.

export default function Asistente({
  paso,
  total,
  pregunta,
  ayuda,
  children,
  alAtras,
  alSiguiente,
  textoSiguiente = "Siguiente",
  puedeSeguir = true,
  cargando = false,
}) {
  // Hacia dónde se movió el último cambio de paso (estado derivado del prop).
  const [ultimoPaso, setUltimoPaso] = useState(paso);
  const [direccion, setDireccion] = useState("derecha");
  if (paso !== ultimoPaso) {
    setDireccion(paso > ultimoPaso ? "derecha" : "izquierda");
    setUltimoPaso(paso);
  }

  const esUltimo = paso === total;

  return (
    <form
      className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta"
      onSubmit={(e) => {
        e.preventDefault();
        if (puedeSeguir && !cargando) alSiguiente();
      }}
    >
      <div
        className="h-1.5 bg-suave"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={paso}
        aria-label={`Paso ${paso} de ${total}`}
      >
        <div className="barra-progreso h-full bg-rojo" style={{ width: `${(paso / total) * 100}%` }} />
      </div>

      <div key={paso} className={`px-6 pt-8 pb-6 sm:px-10 ${direccion === "derecha" ? "deslizar-derecha" : "deslizar-izquierda"}`}>
        <p className="etiqueta">
          Paso {paso} de {total}
        </p>
        <h2 className="mt-2 text-3xl font-bold">{pregunta}</h2>
        {ayuda && <p className="mt-2 text-lg text-gris">{ayuda}</p>}
        <div className="mt-7">{children}</div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-linea px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        {paso > 1 ? (
          <Boton variante="gris" icono={ArrowLeft} onClick={alAtras}>
            Atrás
          </Boton>
        ) : (
          <span />
        )}
        <Boton type="submit" icono={esUltimo ? undefined : ArrowRight} disabled={!puedeSeguir || cargando}>
          {cargando ? "Guardando…" : textoSiguiente}
        </Boton>
      </div>
    </form>
  );
}
