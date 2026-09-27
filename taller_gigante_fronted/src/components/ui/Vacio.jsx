// Lo que se ve cuando no hay datos: nunca una pantalla en blanco, siempre qué
// hacer ("Toque «Recibir un carro» para agregar el primero").

export default function Vacio({ icono: Icono, titulo, children, accion }) {
  return (
    <div className="animar-entrada flex flex-col items-center rounded-tarjeta border-2 border-dashed border-linea-fuerte bg-tarjeta/60 px-6 py-14 text-center">
      {Icono && (
        <span className="flotar mb-5 grid size-20 place-items-center rounded-full bg-suave text-tinta">
          <Icono aria-hidden="true" size={36} strokeWidth={1.8} />
        </span>
      )}
      <p className="text-2xl font-bold">{titulo}</p>
      {children && <p className="mt-2 max-w-md text-lg text-gris">{children}</p>}
      {accion && <div className="mt-7">{accion}</div>}
    </div>
  );
}
