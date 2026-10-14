import Placa from "../ui/Placa";

// Último paso del asistente: todo lo anotado, con "Cambiar" para volver al
// paso de cada dato.

export default function Resumen({ filas, alCambiar }) {
  return (
    <dl className="divide-y divide-linea rounded-tarjeta border border-linea">
      {filas.map(({ etiqueta, valor, esPlaca, paso }) => (
        <div key={etiqueta} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="min-w-0">
            <dt className="text-base text-gris">{etiqueta}</dt>
            <dd className="mt-0.5 text-lg font-bold break-words">
              {esPlaca ? <Placa>{valor}</Placa> : valor}
            </dd>
          </div>
          {paso && (
            <button
              type="button"
              onClick={() => alCambiar(paso)}
              className="min-h-12 shrink-0 px-2 text-lg font-bold text-rojo underline-offset-4 hover:underline"
            >
              Cambiar
            </button>
          )}
        </div>
      ))}
    </dl>
  );
}
