// Caja principal del sistema: esquinas rectas, borde fino y sombra corta.
// El título lleva un cuadrito rojo, guiño al ícono de las ventanas de antes
// (sin botones falsos de minimizar o cerrar, que confunden).

export default function Ventana({ titulo, icono: Icono, children, className = "" }) {
  return (
    <section className={`border border-linea bg-panel shadow-dura ${className}`}>
      {titulo && (
        <h2 className="rotulo flex items-center gap-3 border-b border-linea px-5 py-3 text-lg text-texto-2">
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-rojo" />
          {Icono && <Icono aria-hidden="true" size={20} className="text-acero" />}
          {titulo}
        </h2>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
