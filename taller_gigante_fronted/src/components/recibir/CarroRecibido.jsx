import { ArrowRight, Plus } from "lucide-react";
import Boton from "../ui/Boton";
import Confeti from "../ui/Confeti";
import Placa from "../ui/Placa";

// Pantalla de celebración al guardar: confeti, palomita y qué hacer después.

export default function CarroRecibido({ trabajoId, placa, esCita, alRecibirOtro }) {
  return (
    <div className="relative mx-auto max-w-2xl">
      <Confeti />
      <div className="aparecer flex flex-col items-center rounded-tarjeta border border-linea bg-tarjeta px-6 py-12 text-center shadow-elevada">
        <span className="grid size-22 place-items-center rounded-full bg-verde text-white">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="dibujar" d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h1 className="mt-6 text-4xl font-bold">{esCita ? "¡Cita anotada!" : "¡Carro recibido!"}</h1>
        <div className="mt-4">
          <Placa grande>{placa}</Placa>
        </div>
        <p className="mt-4 max-w-md text-lg text-gris">
          {esCita
            ? "Cuando el carro llegue, búsquelo en «Carros en el taller» y toque «Ya llegó el carro»."
            : "Ya está en «Carros en el taller». El siguiente paso es revisarlo y anotar el diagnóstico."}
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Boton to={`/trabajos/${trabajoId}`} icono={ArrowRight}>
            Ver el trabajo
          </Boton>
          <Boton variante="secundario" icono={Plus} onClick={alRecibirOtro}>
            Recibir otro carro
          </Boton>
        </div>
      </div>
    </div>
  );
}
