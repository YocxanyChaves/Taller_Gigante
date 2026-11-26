// Menú para filtrar una lista ("Todos 6", "Listos 2"). Todas del mismo
// tamaño, con su `marca` arriba (en «Carros en el taller», el semaforito). Cada opción es un
// botón de verdad (aria-pressed) que se ve tocable: borde, se levanta al pasar
// el mouse y se aprieta al tocarlo. La elegida queda rellena en negro con su
// cantidad en un circulito, y una flechita abajo que marca "aquí está".
// En celular se desplazan de lado.

export default function Pestanas({ opciones, valor, alCambiar, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} className="-mx-4 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:px-0">
      <div className="grid min-w-max auto-cols-fr grid-flow-col gap-3 sm:min-w-0">
        {opciones.map(({ valor: v, texto, cantidad, marca }) => {
          const elegida = v === valor;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={elegida}
              onClick={() => alCambiar(v)}
              className={
                "chip-menu relative flex min-h-14 cursor-pointer flex-col items-center justify-center gap-2 rounded-tarjeta border-2 px-5 py-3 text-lg font-bold whitespace-nowrap " +
                (elegida
                  ? "border-tinta bg-tinta text-white shadow-elevada"
                  : "border-linea-fuerte bg-tarjeta text-tinta hover:border-tinta")
              }
            >
              {/* `marca` puede ser una función que recibe si está elegida
                  (el semaforito se enciende solo en la elegida). */}
              {marca && (
                <span className={`inline-flex rounded-full ring-2 ${elegida ? "aro-encender ring-white" : "ring-white/0"}`}>
                  {typeof marca === "function" ? marca(elegida) : marca}
                </span>
              )}
              <span className="flex items-center gap-2">
                {texto}
                {cantidad != null && (
                  <span
                    className={
                      "numeros grid min-w-8 place-items-center rounded-full px-2 py-0.5 text-base " +
                      (elegida ? "bg-white text-tinta" : "bg-suave text-gris")
                    }
                  >
                    {cantidad}
                  </span>
                )}
              </span>
              {elegida && (
                <span
                  aria-hidden="true"
                  className="aparecer absolute -bottom-2 left-1/2 size-3.5 -translate-x-1/2 rotate-45 bg-tinta"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
