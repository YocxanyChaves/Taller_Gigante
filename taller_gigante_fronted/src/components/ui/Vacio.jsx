// Lo que se ve cuando no hay datos: nunca una pantalla en blanco, siempre qué
// hacer ("Toque «Nuevo trabajo» para agregar el primero").

export default function Vacio({ icono: Icono, titulo, children, accion }) {
  return (
    <div className="flex flex-col items-center rounded-panel border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      {Icono && (
        <span className="mb-5 grid size-20 place-items-center rounded-full border border-azul-vivo/30 bg-azul/10 text-azul-vivo shadow-brillo-azul">
          <Icono aria-hidden="true" size={36} strokeWidth={1.5} />
        </span>
      )}
      <p className="rotulo text-2xl text-texto">{titulo}</p>
      {children && <p className="mt-2 max-w-md text-lg text-texto-2">{children}</p>}
      {accion && <div className="mt-7">{accion}</div>}
    </div>
  );
}
