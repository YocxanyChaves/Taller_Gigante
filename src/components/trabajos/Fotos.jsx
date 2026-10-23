import { useCallback, useRef, useState } from "react";
import { Camera, Images, RotateCw, Video } from "lucide-react";
import { subirFoto, borrarFoto, VIDEO_MB_MAXIMO } from "../../services/fotos";
import { textoFotos } from "../../lib/etapas";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Campo from "../ui/Campo";
import Dialogo from "../ui/Dialogo";
import Confirmar from "../ui/Confirmar";
import Galeria from "../ui/Galeria";

// Fotos y videos de evidencia del trabajo (cómo llegó, el ruido que hace, el
// repuesto dañado, cómo quedó), para evitar malentendidos. El cliente también
// los ve en su link. «Agregar fotos o videos» pregunta qué muestran
// (opcional) y deja tomar la foto, grabar el video o escogerlos de la
// galería: son entradas aparte porque en muchos celulares la que deja escoger
// varias a la vez solo abre la galería. Máximo 12 por trabajo (3 videos).
// Con `pedirLlegada` se abre solo con la nota «Así llegó» (viene de «¡Carro
// agregado!»). Las fotos las carga la ficha
// (`fotos`: undefined mientras cargan), que también las usa en «Por dónde ha
// pasado» y en el historial para el cliente; `alCambio` las vuelve a pedir.

const MAXIMO = 12;
const MAXIMO_VIDEOS = 3;
const NOTAS_RAPIDAS = ["Así llegó", "El ruido que hace", "Repuesto dañado", "Así quedó"];

export default function Fotos({ trabajo, fotos, error, alCambio, pedirLlegada = false }) {
  const [agregando, setAgregando] = useState(pedirLlegada);
  const [nota, setNota] = useState(pedirLlegada ? "Así llegó" : "");
  const [subiendo, setSubiendo] = useState(null); // { hecho, total } mientras sube
  const [errorSubir, setErrorSubir] = useState("");
  const [porBorrar, setPorBorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState("");
  const refArchivo = useRef(null);
  const refCamara = useRef(null);
  const refVideo = useRef(null);

  const quedan = MAXIMO - (fotos?.length ?? 0);
  const quedanVideos = MAXIMO_VIDEOS - (fotos?.filter((f) => f.tipo === "video").length ?? 0);

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
        <h2 className="text-xl font-bold">Fotos y videos</h2>
        <p className="text-base text-gris">
          Para que no haya malentendidos: cómo llegó, el ruido que hacía, lo que estaba malo, cómo quedó. El cliente
          también los ve en su link.
        </p>
        {fotos?.length > 0 && <p className="mt-1 text-base font-bold">{textoFotos(fotos)}</p>}
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
            Agregar fotos o videos
          </Boton>
        ) : (
          <p className="text-base text-gris">
            Ya tiene {MAXIMO} fotos y videos, que es el máximo. Borre alguno para agregar otro.
          </p>
        )
      )}

      <input
        ref={refArchivo}
        type="file"
        accept={quedanVideos > 0 ? "image/*,video/*" : "image/*"}
        multiple
        hidden
        onChange={alEscoger}
      />
      <input ref={refCamara} type="file" accept="image/*" capture="environment" hidden onChange={alEscoger} />
      <input ref={refVideo} type="file" accept="video/*" capture="environment" hidden onChange={alEscoger} />

      <Dialogo
        abierto={agregando}
        titulo="Agregar fotos o videos"
        alCerrar={subiendo ? () => {} : cerrarAgregar}
        pie={
          <>
            <Boton variante="secundario" onClick={cerrarAgregar} disabled={!!subiendo}>
              Volver
            </Boton>
            {subiendo ? (
              <Boton icono={Camera} disabled>
                Subiendo {subiendo.hecho + 1} de {subiendo.total}…
              </Boton>
            ) : (
              <>
                <Boton variante="secundario" icono={Images} onClick={() => refArchivo.current?.click()}>
                  Escoger de la galería
                </Boton>
                {quedanVideos > 0 && (
                  <Boton variante="secundario" icono={Video} onClick={() => refVideo.current?.click()}>
                    Grabar video
                  </Boton>
                )}
                <Boton icono={Camera} onClick={() => refCamara.current?.click()}>
                  Tomar foto
                </Boton>
              </>
            )}
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
            De la galería puede escoger varias a la vez{quedan < MAXIMO ? ` (le caben ${quedan} más)` : ""}.
          </p>
          <p className="text-base text-gris">
            {quedanVideos > 0
              ? `Videos: cortos, de unos 30 segundos (máximo ${VIDEO_MB_MAXIMO} MB). Le caben ${quedanVideos === 1 ? "1 video" : `${quedanVideos} videos`} más.`
              : `Ya tiene ${MAXIMO_VIDEOS} videos, que es el máximo: solo le caben fotos.`}
          </p>
          {errorSubir && <p role="alert" className="font-bold text-rojo">{errorSubir}</p>}
        </div>
      </Dialogo>

      <Confirmar
        abierto={porBorrar !== null}
        titulo={porBorrar?.tipo === "video" ? "¿Borrar este video?" : "¿Borrar esta foto?"}
        textoConfirmar={porBorrar?.tipo === "video" ? "Sí, borrarlo" : "Sí, borrarla"}
        peligro
        cargando={borrando}
        alConfirmar={hacerBorrar}
        alCancelar={() => {
          setPorBorrar(null);
          setErrorBorrar("");
        }}
      >
        {porBorrar?.url && porBorrar.tipo !== "video" && (
          <img src={porBorrar.url} alt="" className="mb-3 max-h-48 rounded-control" />
        )}
        {porBorrar?.url && porBorrar.tipo === "video" && (
          <video src={porBorrar.url} muted playsInline preload="metadata" className="mb-3 max-h-48 rounded-control" />
        )}
        Se borra para siempre y el cliente ya no {porBorrar?.tipo === "video" ? "lo" : "la"} va a ver.
        {errorBorrar && <p role="alert" className="mt-3 font-bold text-rojo">{errorBorrar}</p>}
      </Confirmar>
    </section>
  );
}
