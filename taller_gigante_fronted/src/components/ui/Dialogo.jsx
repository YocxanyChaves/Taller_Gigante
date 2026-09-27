import { useEffect, useId } from "react";

// Ventanita encima de la pantalla para algo corto (anotar la llegada del
// carro, la respuesta del cliente). Aparece con un rebote; Escape la cierra.
// Con `alEnviar`, el contenido y el pie forman un <form> (Enter envía).
// `rol="alertdialog"` para preguntas de confirmar (ver <Confirmar>).

export default function Dialogo({ abierto, titulo, children, pie, alCerrar, alEnviar, rol = "dialog" }) {
  const id = useId();

  useEffect(() => {
    if (!abierto) return;
    const alTecla = (e) => {
      if (e.key === "Escape") alCerrar();
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [abierto, alCerrar]);

  if (!abierto) return null;

  const cuerpo = (
    <>
      <div id={`${id}-contenido`} className="max-h-[65vh] overflow-y-auto px-6 pt-3 pb-6 text-lg text-gris">
        {children}
      </div>
      {pie && <div className="flex flex-col-reverse gap-3 border-t border-linea p-5 sm:flex-row sm:justify-end">{pie}</div>}
    </>
  );

  return (
    <div className="oscurecer fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4 backdrop-blur-sm">
      <div
        role={rol}
        aria-modal="true"
        aria-labelledby={`${id}-titulo`}
        aria-describedby={`${id}-contenido`}
        className="aparecer w-full max-w-lg rounded-tarjeta bg-tarjeta shadow-elevada"
      >
        <h2 id={`${id}-titulo`} className="px-6 pt-6 text-2xl font-bold text-tinta">
          {titulo}
        </h2>
        {alEnviar ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alEnviar();
            }}
          >
            {cuerpo}
          </form>
        ) : (
          cuerpo
        )}
      </div>
    </div>
  );
}
