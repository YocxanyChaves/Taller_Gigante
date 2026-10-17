import { useCallback, useRef, useState } from "react";
import { Camera, RotateCw } from "lucide-react";
import { subirFoto, borrarFoto } from "../../services/fotos";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Campo from "../ui/Campo";
import Dialogo from "../ui/Dialogo";
import Confirmar from "../ui/Confirmar";
import Galeria from "../ui/Galeria";

// Fotos de evidencia del trabajo (cómo llegó, el repuesto dañado, cómo
// quedó), para evitar malentendidos. El cliente también las ve en su link.
// «Agregar fotos» pregunta qué muestran (opcional) y abre la cámara o la
// galería del celular. Con `pedirLlegada` se abre solo con la nota «Así
// llegó» (viene de «¡Carro agregado!»). Las fotos las carga la ficha
// (`fotos`: undefined mientras cargan), que también las usa en «Por dónde ha
// pasado» y en el historial para el cliente; `alCambio` las vuelve a pedir.

const MAXIMO = 12;
const NOTAS_RAPIDAS = ["Así llegó", "Repuesto dañado", "Así quedó"];

export default function Fotos({ trabajo, fotos, error, alCambio, pedirLlegada = false }) {
  const [agregando, setAgregando] = useState(pedirLlegada);
  const [nota, setNota] = useState(pedirLlegada ? "Así llegó" : "");
  const [subiendo, setSubiendo] = useState(null); // { hecho, total } mientras sube
  const [errorSubir, setErrorSubir] = useState("");
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState("");
  const refArchivo = useRef(null);

  const quedan = MAXIMO - (fotos?.length ?? 0);

  const cerrarAgregar = useCallback(() => {
    setAgregando(false);
    setNota("");
    setErrorSubir("");
  }, []);

  const alEscoger = async (e) => {
    const archivos = [...e.target.files].slice(0, quedan);
    e.target.value = "";
    if (!archivos.length) return;
    setErrorSubir("");
    setSubiendo({ hecho: 0, total: archivos.length });
    try {
      for (const [i, archivo] of archivos.entries()) {
        await subirFoto(trabajo.id, archivo, nota);
        setSubiendo({ hecho: i + 1, total: archivos.length });
      }
      cerrarAgregar();
    } catch (err) {
      setErrorSubir(mensajeError(err));
    } finally {
      setSubiendo(null);
      await alCambio();
    }
  };

  const hacerBorrar = async () => {
    setBorrando(true);
    setErrorBorrar("");
    try {
      await borrarFoto(porBorrar);
      setPorBorrar(null);
      await alCambio();
    } catch (e) {
      setErrorBorrar(mensajeError(e));
    } finally {
      setBorrando(false);
    }
  };

  return (
    <section className="flex flex-col gap-4 rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta">
      <div>
        <h2 className="text-xl font-bold">Fotos</h2>
        <p className="text-base text-gris">
          Para que no haya malentendidos: cómo llegó, lo que estaba malo, cómo quedó. El cliente también las ve en su
          link.
        </p>
      </div>

      {error && (
        <div className="flex flex-col items-start gap-2">
          <p role="alert" className="font-bold text-rojo">{error}</p>
          <Boton variante="secundario" icono={RotateCw} onClick={alCambio}>
            Intentar de nuevo
          </Boton>
        </div>
      )}

      {!error && fotos === undefined && <p className="animate-pulse text-lg text-gris">Cargando las fotos…</p>}

      {fotos?.length > 0 && (
        <Galeria
          fotos={fotos}
          alBorrar={(foto) => setPorBorrar(foto)}
        />
      )}

      {fotos && (
        quedan > 0 ? (
          <Boton variante="secundario" icono={Camera} onClick={() => setAgregando(true)} className="self-start">
            Agregar fotos
          </Boton>
        ) : (
          <p className="text-base text-gris">Ya tiene {MAXIMO} fotos, que es el máximo. Borre alguna para agregar otra.</p>
        )
      )}

      <input ref={refArchivo} type="file" accept="image/*" multiple hidden onChange={alEscoger} />

      <Dialogo
        abierto={agregando}
        titulo="Agregar fotos"
        alCerrar={subiendo ? () => {} : cerrarAgregar}
        pie={
          <>
            <Boton variante="secundario" onClick={cerrarAgregar} disabled={!!subiendo}>
              Volver
            </Boton>
            <Boton icono={Camera} onClick={() => refArchivo.current?.click()} disabled={!!subiendo}>
              {subiendo ? `Subiendo ${subiendo.hecho + 1} de ${subiendo.total}…` : "Tomar o escoger fotos"}
            </Boton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Campo
            etiqueta="¿Qué muestran?"
            opcional
            value={nota}
            maxLength={120}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Por ejemplo: rayón en la puerta"
          />
          <div className="flex flex-wrap gap-2">
            {NOTAS_RAPIDAS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNota(n)}
                className={`min-h-11 rounded-control border-2 px-4 text-base font-bold transition-colors ${
                  nota === n ? "border-tinta bg-suave text-tinta" : "border-linea-fuerte text-gris hover:border-tinta"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="text-base">
            Puede escoger varias a la vez{quedan < MAXIMO ? ` (le caben ${quedan} más)` : ""}.
          </p>
          {errorSubir && <p role="alert" className="font-bold text-rojo">{errorSubir}</p>}
        </div>
      </Dialogo>

      <Confirmar
        abierto={porBorrar !== null}
        titulo="¿Borrar esta foto?"
        textoConfirmar="Sí, borrarla"
        peligro
        cargando={borrando}
        alConfirmar={hacerBorrar}
        alCancelar={() => {
          setPorBorrar(null);
          setErrorBorrar("");
        }}
      >
        {porBorrar?.url && <img src={porBorrar.url} alt="" className="mb-3 max-h-48 rounded-control" />}
        Se borra para siempre y el cliente ya no la va a ver.
        {errorBorrar && <p role="alert" className="mt-3 font-bold text-rojo">{errorBorrar}</p>}
      </Confirmar>
    </section>
  );
}
