import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Ban, RotateCw, SearchX, Undo2 } from "lucide-react";
import { obtenerTrabajo, avanzarEstado } from "../services/trabajos";
import { ESTADOS } from "../lib/estados";
import { nombreCarro } from "../lib/formato";
import { mensajeError } from "../lib/errores";
import Placa from "../components/ui/Placa";
import Insignia from "../components/ui/Insignia";
import Boton from "../components/ui/Boton";
import Aviso from "../components/ui/Aviso";
import Vacio from "../components/ui/Vacio";
import Confirmar from "../components/ui/Confirmar";
import SiguientePaso from "../components/trabajos/SiguientePaso";
import Cotizacion from "../components/trabajos/Cotizacion";
import DatosTrabajo from "../components/trabajos/DatosTrabajo";
import LinkCliente from "../components/trabajos/LinkCliente";
import useRefrescar from "../lib/useRefrescar";
import LineaTiempo from "../components/trabajos/LineaTiempo";
import Pagos from "../components/trabajos/Pagos";

// Ficha de un trabajo: arriba el carro y su estado; al centro el botón del
// siguiente paso y el precio; al lado los datos, por dónde ha pasado y las
// acciones de poco uso (volver un paso, cancelar), siempre con confirmación.

export default function Trabajo() {
  const { id } = useParams();
  const navegar = useNavigate();
  const [trabajo, setTrabajo] = useState(undefined); // undefined = cargando, null = no existe
  const [error, setError] = useState("");
  const [editandoPrecio, setEditandoPrecio] = useState(false);
  const [preguntando, setPreguntando] = useState(null); // "volver" | "cancelar" | null
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");

  const cargar = useCallback(
    () =>
      obtenerTrabajo(id)
        .then((datos) => {
          setTrabajo(datos);
          setError("");
        })
        .catch((e) => setError(mensajeError(e))),
    [id]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Si el cliente responde desde su link, la ficha se actualiza sola.
  useRefrescar(cargar, 20000);

  if (error) {
    return (
      <Aviso
        tipo="alerta"
        titulo="No se pudo cargar el trabajo"
        accion={
          <Boton variante="secundario" icono={RotateCw} onClick={cargar}>
            Intentar de nuevo
          </Boton>
        }
      >
        {error}
      </Aviso>
    );
  }

  if (trabajo === undefined) {
    return <p className="animate-pulse text-xl text-gris">Cargando el trabajo…</p>;
  }

  if (trabajo === null) {
    return (
      <Vacio
        icono={SearchX}
        titulo="No encontramos ese trabajo"
        accion={
          <Boton variante="secundario" to="/trabajos">
            Ver los carros en el taller
          </Boton>
        }
      >
        Puede que se haya borrado o que el enlace esté mal.
      </Vacio>
    );
  }

  const activo = !["entregado", "cancelado"].includes(trabajo.estado);
  const anterior = trabajo.historial.length > 1 ? trabajo.historial.at(-2).estado : null;
  const carro = `${nombreCarro(trabajo.vehiculo)} ${trabajo.vehiculo?.placa?.toUpperCase() ?? ""}`.trim();

  const hacerAccion = async () => {
    setGuardando(true);
    setErrorAccion("");
    try {
      if (preguntando === "cancelar") {
        await avanzarEstado(trabajo.id, "cancelado");
        navegar("/trabajos");
        return;
      }
      await avanzarEstado(trabajo.id, anterior);
      setPreguntando(null);
      await cargar();
    } catch (e) {
      setErrorAccion(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  const abrirEditor = () => {
    setEditandoPrecio(true);
    requestAnimationFrame(() =>
      document.getElementById("precio")?.scrollIntoView({ behavior: "smooth", block: "start" })
    );
  };

  return (
    <>
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-start gap-3">
          <Placa grande>{trabajo.vehiculo?.placa?.toUpperCase() ?? "SIN PLACA"}</Placa>
          <h1 className="text-4xl font-bold">{nombreCarro(trabajo.vehiculo)}</h1>
        </div>
        <Insignia estado={trabajo.estado} grande />
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex flex-col gap-6">
          {!editandoPrecio && <SiguientePaso trabajo={trabajo} alEditarPrecio={abrirEditor} alCambio={cargar} />}
          <div id="precio" className="scroll-mt-24">
            <Cotizacion
              trabajo={trabajo}
              editando={editandoPrecio}
              alEditar={(si) => (si ? abrirEditor() : setEditandoPrecio(false))}
              alGuardado={async () => {
                setEditandoPrecio(false);
                await cargar();
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Pagos trabajo={trabajo} alCambio={cargar} />
          <DatosTrabajo trabajo={trabajo} />
          {trabajo.estado !== "cancelado" && <LinkCliente trabajo={trabajo} alCambio={cargar} />}
          <LineaTiempo historial={trabajo.historial} />

          {activo && (
            <section className="flex flex-col gap-2">
              <p className="etiqueta">Otras acciones</p>
              {anterior && anterior !== trabajo.estado && (
                <Boton variante="gris" icono={Undo2} className="justify-start" onClick={() => setPreguntando("volver")}>
                  Volver a «{ESTADOS[anterior]?.texto ?? anterior}»
                </Boton>
              )}
              <Boton variante="gris" icono={Ban} className="justify-start" onClick={() => setPreguntando("cancelar")}>
                Cancelar este trabajo
              </Boton>
            </section>
          )}
        </div>
      </div>

      <Confirmar
        abierto={preguntando !== null}
        titulo={preguntando === "cancelar" ? "¿Cancelar este trabajo?" : "¿Volver un paso?"}
        textoConfirmar={preguntando === "cancelar" ? "Sí, cancelarlo" : "Sí, volver"}
        peligro={preguntando === "cancelar"}
        cargando={guardando}
        alConfirmar={hacerAccion}
        alCancelar={() => {
          setPreguntando(null);
          setErrorAccion("");
        }}
      >
        {preguntando === "cancelar" ? (
          <>
            El trabajo del <strong className="text-tinta">{carro}</strong> se va a cancelar y ya no va a aparecer en
            «Carros en el taller».
          </>
        ) : (
          <>
            El trabajo del <strong className="text-tinta">{carro}</strong> vuelve a «
            {ESTADOS[anterior]?.texto ?? anterior}». Úselo si tocó un botón por error.
          </>
        )}
        {errorAccion && <p role="alert" className="mt-3 font-bold text-rojo">{errorAccion}</p>}
      </Confirmar>
    </>
  );
}
