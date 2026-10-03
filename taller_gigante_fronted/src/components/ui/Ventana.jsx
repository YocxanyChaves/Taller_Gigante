// Tarjeta blanca con borde suave: la caja principal del sistema.

export default function Ventana({ titulo, icono: Icono, children, className = "" }) {
  return (
    <section className={`rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta ${className}`}>
      {titulo && (
        <h2 className="flex items-center gap-3 border-b border-linea px-6 py-4 text-xl font-bold">
          {Icono && <Icono aria-hidden="true" size={22} className="text-gris" />}
          {titulo}
        </h2>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
