// Lo que se ve cuando no hay datos: nunca una pantalla en blanco, siempre qué
// hacer ("Toque «Nuevo trabajo» para agregar el primero").

export default function Vacio({ icono: Icono, titulo, children, accion }) {
  return (
    <div className="flex flex-col items-center border border-dashed border-linea bg-panel/40 px-6 py-12 text-center">
      {Icono && <Icono aria-hidden="true" size={44} strokeWidth={1.5} className="mb-4 text-acero" />}
      <p className="rotulo text-2xl text-texto">{titulo}</p>
      {children && <p className="mt-2 max-w-md text-lg text-texto-2">{children}</p>}
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}
