import { ArrowLeft, ArrowRight } from "lucide-react";
import Boton from "./Boton";

// Formulario de una pregunta por pantalla, con "Paso 2 de 4" y barra de
// progreso. Es controlado: la pantalla que lo usa guarda el paso y las
// respuestas, así que "Atrás" nunca borra lo escrito.

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
      className="border-2 border-linea bg-panel shadow-dura"
      onSubmit={(e) => {
        e.preventDefault();
        if (puedeSeguir && !cargando) alSiguiente();
      }}
    >
      <div className="barra-titulo px-4 py-2">
        <p className="rotulo text-lg text-white">
          Paso {paso} de {total}
        </p>
      </div>
      <div
        className="h-3 bg-panel-hundido shadow-hundido"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={paso}
        aria-label={`Paso ${paso} de ${total}`}
      >
        <div className="h-full bg-azul-vivo" style={{ width: `${(paso / total) * 100}%` }} />
      </div>

      <div className="p-5 sm:p-8">
        <h2 className="rotulo text-3xl text-texto">{pregunta}</h2>
        {ayuda && <p className="mt-2 text-lg text-texto-2">{ayuda}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <div className="flex flex-col-reverse gap-4 border-t-2 border-linea p-5 sm:flex-row sm:justify-between">
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
