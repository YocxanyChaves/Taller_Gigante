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
      className="vidrio overflow-hidden"
      onSubmit={(e) => {
        e.preventDefault();
        if (puedeSeguir && !cargando) alSiguiente();
      }}
    >
      <div className="border-b border-white/[0.06] px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="rotulo text-base text-texto-2">
            Paso {paso} de {total}
          </p>
          {/* Un punto por paso: los hechos encendidos. */}
          <div aria-hidden="true" className="flex gap-2">
            {Array.from({ length: total }, (_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full ${i < paso ? "luz bg-azul-vivo text-azul-vivo" : "bg-white/15"}`}
              />
            ))}
          </div>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={paso}
          aria-label={`Paso ${paso} de ${total}`}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-azul to-azul-vivo shadow-[0_0_16px_rgb(79_157_255/0.8)] transition-[width] duration-500"
            style={{ width: `${(paso / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <h2 className="rotulo text-3xl text-texto">{pregunta}</h2>
        {ayuda && <p className="mt-2 text-lg text-texto-2">{ayuda}</p>}
        <div className="mt-6">{children}</div>
      </div>

      <div className="flex flex-col-reverse gap-4 border-t border-white/[0.06] p-6 sm:flex-row sm:justify-between sm:px-8">
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
