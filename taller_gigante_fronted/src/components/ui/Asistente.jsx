import { ArrowLeft, ArrowRight } from "lucide-react";
import Boton from "./Boton";

// Formulario de una pregunta por pantalla, con "Paso 2 de 4" y barra de
// progreso. Es controlado: la pantalla que lo usa guarda el paso y las
// respuestas, así que "Atrás" nunca borra lo escrito.

const BLOQUES = 20;

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
  const esUltimo = paso === total;

  return (
    <form
      className="border border-linea bg-panel shadow-dura"
      onSubmit={(e) => {
        e.preventDefault();
        if (puedeSeguir && !cargando) alSiguiente();
      }}
    >
      <div className="border-b border-linea px-5 py-4 sm:px-8">
        <p className="rotulo text-base text-texto-2">
          Paso {paso} de {total}
        </p>
        {/* Barra en bloques, como las de antes. */}
        <div
          className="mt-2 grid gap-1"
          style={{ gridTemplateColumns: `repeat(${BLOQUES}, minmax(0, 1fr))` }}
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={paso}
          aria-label={`Paso ${paso} de ${total}`}
        >
          {Array.from({ length: BLOQUES }, (_, i) => (
            <span
              key={i}
              className={`h-2.5 ${i < Math.round((paso / total) * BLOQUES) ? "bg-azul-vivo" : "bg-linea"}`}
            />
          ))}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <h2 className="rotulo text-3xl text-texto">{pregunta}</h2>
        {ayuda && <p className="mt-2 text-lg text-texto-2">{ayuda}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <div className="flex flex-col-reverse gap-4 border-t border-linea p-5 sm:flex-row sm:justify-between sm:px-8">
        {paso > 1 ? (
          <Boton variante="secundario" icono={ArrowLeft} onClick={alAtras}>
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
