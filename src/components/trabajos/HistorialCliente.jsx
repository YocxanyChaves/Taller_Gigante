import { useState } from "react";
import { Download, FileText, Share2 } from "lucide-react";
import { armarHistorialPdf, compartirPdf, puedeCompartirArchivos } from "../../lib/historialPdf";
import Boton from "../ui/Boton";
import Desplegable from "../ui/Desplegable";

// «Historial para el cliente»: un PDF con por dónde pasó el carro (con las
// fotos de cada etapa), el diagnóstico, el precio y los pagos. El cliente se
// lo queda para siempre, aunque el link venza. Primero se prepara (baja las
// fotos) y después se manda o se descarga: el celular solo deja abrir
// «Compartir» justo después de tocar un botón.

export default function HistorialCliente({ trabajo, fotos }) {
  const [pdf, setPdf] = useState(null);
  const [preparando, setPreparando] = useState(false);
  const [error, setError] = useState("");
  const compartible = puedeCompartirArchivos();

  const preparar = async () => {
    setPreparando(true);
    setError("");
    try {
      // Los videos no caben en un PDF: solo van las fotos.
      setPdf(await armarHistorialPdf(trabajo, (fotos ?? []).filter((f) => f.tipo !== "video")));
    } catch {
      setError("No se pudo hacer el PDF. Revise el internet e intente de nuevo.");
    } finally {
      setPreparando(false);
    }
  };

  const compartir = async () => {
    setError("");
    try {
      if (!(await compartirPdf(pdf))) pdf.doc.save(pdf.nombre);
    } catch {
      setError("No se pudo abrir «Compartir». Descárguelo y mándelo usted.");
    }
  };

  return (
    <Desplegable titulo="Historial para el cliente" resumen="Un PDF para que se lo quede">
      <div className="flex flex-col gap-3 p-6">
        <p className="text-base text-gris">
          Trae por dónde pasó el carro con sus fotos, lo que tenía, el precio y los pagos. No trae lo que le costaron
          los repuestos al taller. El cliente se lo queda aunque el link venza.
        </p>

        {!pdf ? (
          <Boton variante="secundario" icono={FileText} onClick={preparar} disabled={preparando || fotos === undefined}>
            {preparando ? "Preparando…" : "Preparar el PDF"}
          </Boton>
        ) : (
          <>
            <p role="status" className="font-bold text-verde-texto">
              ¡Listo! {pdf.nombre}
            </p>
            {compartible && (
              <Boton variante="whatsapp" icono={Share2} onClick={compartir}>
                Mandarlo por WhatsApp
              </Boton>
            )}
            <Boton variante="secundario" icono={Download} onClick={() => pdf.doc.save(pdf.nombre)}>
              Descargarlo
            </Boton>
            <Boton variante="gris" className="justify-start" onClick={() => setPdf(null)}>
              Hacerlo de nuevo
            </Boton>
          </>
        )}

        {error && <p role="alert" className="font-bold text-rojo">{error}</p>}
      </div>
    </Desplegable>
  );
}
