// Pestañas para filtrar una lista ("Todos · 6", "Listos · 2"). Botones de
// verdad con aria-pressed; la elegida queda blanca y levantada. Se pueden
// desplazar de lado en celular.

export default function Pestanas({ opciones, valor, alCambiar, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="inline-flex gap-1 rounded-tarjeta bg-suave p-1">
        {opciones.map(({ valor: v, texto, cantidad, marca }) => {
          const elegida = v === valor;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={elegida}
              onClick={() => alCambiar(v)}
              className={
                "flex min-h-12 items-center gap-2 rounded-control px-4 text-lg whitespace-nowrap transition-[background-color,box-shadow,color] duration-200 " +
                (elegida ? "bg-tarjeta font-bold text-tinta shadow-elevada" : "text-gris hover:text-tinta")
              }
            >
              {marca}
              {texto}
              <span className="numeros">· {cantidad}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
