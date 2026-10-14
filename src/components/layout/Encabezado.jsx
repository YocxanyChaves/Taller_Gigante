// Arriba de cada pantalla: qué es y una frase de qué hacer aquí.

export default function Encabezado({ titulo, children, accion }) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-4xl font-bold">{titulo}</h1>
        {children && <p className="mt-2 max-w-2xl text-xl text-gris">{children}</p>}
      </div>
      {accion}
    </header>
  );
}
