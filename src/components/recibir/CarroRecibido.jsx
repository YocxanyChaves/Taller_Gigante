import { ArrowRight, Camera, Plus } from "lucide-react";
import Boton from "../ui/Boton";
import Confeti from "../ui/Confeti";
import Placa from "../ui/Placa";

// Pantalla de celebración al guardar: confeti, palomita y qué hacer después.
// `tipo`: "aqui" (ya está en el taller), "cita" o "pasada" (visita que ya
// pasó, anotada solo para el historial).

const TEXTOS = {
  aqui: {
    titulo: "¡Carro agregado!",
    frase: "Ya está en «Carros en el taller». El siguiente paso es revisarlo y anotar el diagnóstico.",
  },
  cita: {
    titulo: "¡Cita anotada!",
    frase: "Cuando el carro llegue, búsquelo en «Carros en el taller» y toque «Ya llegó el carro».",
  },
  pasada: {
    titulo: "¡Visita anotada!",
    frase: "Ya quedó en el historial del carro, como entregada. Si quiere, puede agregarle fotos o videos.",
  },
};

export default function CarroRecibido({ trabajoId, placa, tipo, alRecibirOtro }) {
  const { titulo, frase } = TEXTOS[tipo] ?? TEXTOS.aqui;

  return (
    <div className="relative mx-auto max-w-2xl">
      <Confeti />
      <div className="aparecer flex flex-col items-center rounded-tarjeta border border-linea bg-tarjeta px-6 py-12 text-center shadow-elevada">
        <span className="grid size-22 place-items-center rounded-full bg-verde text-white">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="dibujar" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="mt-6 text-4xl font-bold">{titulo}</h1>
        <div className="mt-4">
          <Placa grande>{placa}</Placa>
        </div>
        <p className="mt-4 max-w-md text-lg text-gris">{frase}</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Boton to={`/trabajos/${trabajoId}`} icono={ArrowRight}>
            {tipo === "pasada" ? "Ver la visita" : "Ver el trabajo"}
          </Boton>
          {tipo === "aqui" && (
            <Boton variante="secundario" icono={Camera} to={`/trabajos/${trabajoId}?fotos=llegada`}>
              Tomar fotos de cómo llegó
            </Boton>
          )}
          <Boton variante="secundario" icono={Plus} onClick={alRecibirOtro}>
            Agregar otro carro
          </Boton>
        </div>
      </div>
    </div>
  );
}
