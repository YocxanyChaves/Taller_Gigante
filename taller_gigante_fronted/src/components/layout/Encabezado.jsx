// Arriba de cada pantalla: qué es y una frase de qué hacer aquí.

export default function Encabezado({ titulo, children, accion }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="rotulo bg-gradient-to-r from-white via-white to-texto-2 bg-clip-text text-4xl text-transparent md:text-5xl">
          {titulo}
        </h1>
        <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-rojo-vivo to-azul-vivo" />
        {children && <p className="mt-4 max-w-2xl text-lg text-texto-2">{children}</p>}
      </div>
      {accion}
    </header>
  );
}
