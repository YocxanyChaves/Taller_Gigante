// Caja principal del sistema: barra de título con el degradado de la marca,
// esquinas rectas y sombra dura. Sin botones falsos de minimizar o cerrar
// (confunden).

export default function Ventana({ titulo, icono: Icono, children, className = "" }) {
  return (
    <section className={`border-2 border-linea bg-panel shadow-dura ${className}`}>
      {titulo && (
        <h2 className="barra-titulo rotulo flex items-center gap-2 px-4 py-2 text-lg text-white">
          {Icono && <Icono aria-hidden="true" size={20} />}
          {titulo}
        </h2>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
