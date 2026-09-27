// Panel principal del sistema: vidrio translúcido con el título marcado por
// una luz roja encendida.

export default function Ventana({ titulo, icono: Icono, children, className = "" }) {
  return (
    <section className={`vidrio ${className}`}>
      {titulo && (
        <h2 className="rotulo flex items-center gap-3 border-b border-white/[0.06] px-6 py-4 text-base text-texto-2">
          <span aria-hidden="true" className="luz size-2 shrink-0 bg-rojo-vivo text-rojo-vivo" />
          {Icono && <Icono aria-hidden="true" size={20} className="text-acero" />}
          {titulo}
        </h2>
      )}
      <div className="p-6">{children}</div>
    </section>
  );
}
