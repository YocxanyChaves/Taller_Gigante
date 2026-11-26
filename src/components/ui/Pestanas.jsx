// Menú para filtrar una lista ("Todos 6", "Listos 2"). Cada opción es un
// botón de verdad (aria-pressed) que se ve tocable: borde, se levanta al pasar
// el mouse y se aprieta al tocarlo. La elegida queda rellena en negro con su
// cantidad en un circulito, y una flechita abajo que marca "aquí está".
// En celular se desplazan de lado.

export default function Pestanas({ opciones, valor, alCambiar, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} className="-mx-4 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:px-0">
      <div className="flex gap-3">
        {opciones.map(({ valor: v, texto, cantidad, marca }) => {
          const elegida = v === valor;
          return (
            <button
              key={v}
              type="button"
              aria-pressed={elegida}
              onClick={() => alCambiar(v)}
              className={
                "chip-menu relative flex min-h-14 shrink-0 cursor-pointer items-center gap-3 rounded-tarjeta border-2 px-5 text-lg font-bold whitespace-nowrap " +
                (elegida
                  ? "border-tinta bg-tinta text-white shadow-elevada"
                  : "border-linea-fuerte bg-tarjeta text-tinta hover:border-tinta")
              }
            >
              {marca && (
                <span className={`grid size-6 place-items-center rounded-full ${elegida ? "bg-white" : "bg-suave"}`}>
                  {marca}
                </span>
              )}
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
