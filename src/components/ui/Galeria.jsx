import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { fechaLarga } from "../../lib/formato";

// Fotos en cuadritos; al tocar una se ve grande encima de todo, con su nota,
// la fecha y botones con texto para pasar a la otra o cerrar (Escape y las
// flechas del teclado también sirven). Con `alBorrar`, la vista grande trae
// «Borrar esta foto» (quien la usa pregunta antes de borrar).
// Cada foto: { url, nota, fecha }.

export default function Galeria({ fotos, alBorrar }) {
  const [abierta, setAbierta] = useState(null); // índice de la foto grande

  const cerrar = useCallback(() => setAbierta(null), []);

  return (
    <>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {fotos.map((foto, i) => (
          <li key={foto.url}>
            <button
              type="button"
              onClick={() => setAbierta(i)}
              className="group block aspect-square w-full overflow-hidden rounded-control border border-linea bg-suave"
            >
              <img
                src={foto.url}
                alt={foto.nota || `Foto ${i + 1}`}
                loading="lazy"
                className="size-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      {abierta !== null && fotos[abierta] && (
        <VerFoto
          fotos={fotos}
          indice={abierta}
          alCambiar={setAbierta}
          alCerrar={cerrar}
          alBorrar={alBorrar && (() => alBorrar(fotos[abierta]))}
        />
      )}
    </>
  );
}

function VerFoto({ fotos, indice, alCambiar, alCerrar, alBorrar }) {
  const foto = fotos[indice];
  const hayVarias = fotos.length > 1;
  const anterior = () => alCambiar((indice - 1 + fotos.length) % fotos.length);
  const siguiente = () => alCambiar((indice + 1) % fotos.length);

  useEffect(() => {
    const alTecla = (e) => {
      if (e.key === "Escape") alCerrar();
      if (hayVarias && e.key === "ArrowLeft") alCambiar((indice - 1 + fotos.length) % fotos.length);
      if (hayVarias && e.key === "ArrowRight") alCambiar((indice + 1) % fotos.length);
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [indice, fotos.length, hayVarias, alCambiar, alCerrar]);

  const botonClaro =
    "inline-flex min-h-12 items-center gap-2 rounded-control bg-white/10 px-4 text-lg font-bold text-white transition-colors hover:bg-white/20";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Foto" className="oscurecer fixed inset-0 z-50 flex flex-col bg-tinta/95">
      <div className="flex items-center justify-between gap-3 p-4">
        <p className="text-lg text-white/80">
          {hayVarias ? `Foto ${indice + 1} de ${fotos.length}` : "Foto"}
        </p>
        <button type="button" onClick={alCerrar} className={botonClaro} autoFocus>
          <X aria-hidden="true" size={22} />
          Cerrar
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-center justify-center px-4">
        <img src={foto.url} alt={foto.nota || `Foto ${indice + 1}`} className="aparecer max-h-full max-w-full rounded-control object-contain" />
      </div>

      <div className="flex flex-col gap-3 p-4 text-center">
        {foto.nota && <p className="text-xl font-bold text-white">{foto.nota}</p>}
        {foto.fecha && <p className="text-base text-white/70">{fechaLarga(foto.fecha, true)}</p>}
        <div className="flex flex-wrap justify-center gap-3">
          {hayVarias && (
            <>
              <button type="button" onClick={anterior} className={botonClaro}>
                <ChevronLeft aria-hidden="true" size={22} />
                Anterior
              </button>
              <button type="button" onClick={siguiente} className={botonClaro}>
                Siguiente
                <ChevronRight aria-hidden="true" size={22} />
              </button>
            </>
          )}
          {alBorrar && (
            <button type="button" onClick={alBorrar} className={botonClaro}>
              <Trash2 aria-hidden="true" size={22} />
              Borrar esta foto
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
