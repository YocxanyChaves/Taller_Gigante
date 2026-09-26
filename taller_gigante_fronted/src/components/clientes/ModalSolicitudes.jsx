import { useState } from "react";
import { Loader2, Link2, Search, ArrowLeft, Check, XCircle } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import {
  soloDigitos,
  fichaVinculadaA,
  fichasSinVincular,
  aprobarSolicitud,
  rechazarSolicitud,
} from "../../services/clientes";
import { mensajeError } from "../../lib/errores";

// Bandeja de solicitudes de vinculación: lista, y al revisar una, elegir la
// ficha a la que se vincula. `onCambio` recarga clientes y solicitudes.
export function ModalSolicitudes({ solicitudes, cargando, onClose, onCambio }) {
  const [enRevision, setEnRevision] = useState(null);
  const [fichas, setFichas] = useState([]);
  const [cargandoFichas, setCargandoFichas] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resolviendo, setResolviendo] = useState(false);
  const [yaVinculada, setYaVinculada] = useState(null);
  const [error, setError] = useState("");

  const iniciarRevision = async (solicitud) => {
    setEnRevision(solicitud);
    setBusqueda("");
    setYaVinculada(null);
    setError("");
    setCargandoFichas(true);

    // Puede que esta cuenta ya se haya vinculado por otra vía (ej. desde
    // "Vincular cuenta") mientras la solicitud seguía pendiente. En ese caso
    // no habrá ninguna ficha sin vincular que coincida, y se ofrece resolverla.
    const vinculada = await fichaVinculadaA(solicitud.user_id);

    if (vinculada) {
      setYaVinculada(vinculada);
      setFichas([]);
    } else {
      setFichas(await fichasSinVincular(solicitud.telefono_ingresado));
    }

    setCargandoFichas(false);
  };

  const volverALista = () => {
    setEnRevision(null);
    setFichas([]);
    setBusqueda("");
    setYaVinculada(null);
  };

  const handleAprobar = async (clienteId) => {
    setResolviendo(true);
    setError("");

    const { error: aprobarError } = await aprobarSolicitud(enRevision, clienteId);

    setResolviendo(false);

    if (aprobarError) {
      setError(mensajeError(aprobarError));
      return;
    }

    volverALista();
    onCambio();
  };

  const handleRechazar = async (solicitud) => {
    const confirmado = window.confirm(
      `¿Rechazar la solicitud de ${solicitud.usuarios?.nombre || solicitud.usuarios?.correo || "este usuario"}?`
    );
    if (!confirmado) return;

    setError("");
    const { error: rechazoError } = await rechazarSolicitud(solicitud.id);

    if (rechazoError) {
      setError(mensajeError(rechazoError));
    } else {
      onCambio();
    }
  };

  const fichasFiltradas = fichas.filter((c) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.telefono || "").toLowerCase().includes(q) ||
      (c.correo || "").toLowerCase().includes(q)
    );
  });

  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[80vh] flex flex-col">
      {!enRevision ? (
        <>
          <h2 className="text-xl font-bold mb-1">Solicitudes de vinculación</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Personas que se registraron y piden vincular su cuenta a un cliente
            existente.
          </p>

          <ErrorEnModal mensaje={error} />

          <div className="overflow-y-auto space-y-3 pr-1">
            {cargando ? (
              <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando solicitudes...
              </div>
            ) : solicitudes.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No hay solicitudes pendientes.
              </div>
            ) : (
              solicitudes.map((s) => (
                <div
                  key={s.id}
                  className="rounded-2xl border border-foreground/10 bg-card/60 p-4"
                >
                  <p className="text-sm font-semibold text-foreground">
                    {s.usuarios?.nombre || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mb-1">
                    {s.usuarios?.correo}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Teléfono enviado:{" "}
                    <span className="font-semibold text-foreground/80">
                      {s.telefono_ingresado || "—"}
                    </span>
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => iniciarRevision(s)}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-500/15 text-primary border border-blue-500/30 px-3 py-2 text-xs font-semibold hover:bg-blue-500/25 transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Revisar y aprobar
                    </button>
                    <button
                      onClick={() => handleRechazar(s)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 text-accent px-3 py-2 text-xs font-semibold hover:bg-red-500/20 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={volverALista}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la lista
          </button>

          <h2 className="text-xl font-bold mb-1">
            {yaVinculada ? "Solicitud ya resuelta" : "Elige el cliente para vincular"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Solicitud de{" "}
            <span className="font-semibold text-foreground/80">
              {enRevision.usuarios?.nombre || enRevision.usuarios?.correo}
            </span>{" "}
            · teléfono enviado {enRevision.telefono_ingresado || "—"}
          </p>

          <ErrorEnModal mensaje={error} />

          {yaVinculada ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <p className="text-sm text-foreground">
                Esta cuenta ya está vinculada al cliente{" "}
                <span className="font-semibold">{yaVinculada.nombre}</span>{" "}
                (vinculación manual). Solo falta marcar la solicitud como
                resuelta para que salga de la bandeja de pendientes.
              </p>
              <button
                onClick={() => handleAprobar(yaVinculada.id)}
                disabled={resolviendo}
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-3 text-sm font-semibold hover:bg-emerald-500/25 transition disabled:opacity-60"
              >
                <Check className="h-4 w-4" />
                {resolviendo ? "Marcando..." : "Marcar solicitud como resuelta"}
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, teléfono o correo..."
                  className="w-full pl-11 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="overflow-y-auto space-y-2 pr-1">
                {cargandoFichas ? (
                  <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Buscando clientes...
                  </div>
                ) : fichasFiltradas.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No hay clientes sin vincular disponibles.
                  </div>
                ) : (
                  fichasFiltradas.map((c) => {
                    const coincide =
                      enRevision.telefono_ingresado &&
                      soloDigitos(c.telefono) === soloDigitos(enRevision.telefono_ingresado);

                    return (
                      <button
                        key={c.id}
                        onClick={() => handleAprobar(c.id)}
                        disabled={resolviendo}
                        className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-4 transition disabled:opacity-60 text-left ${
                          coincide
                            ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20"
                            : "border-foreground/10 bg-card/60 hover:bg-blue-500/10 hover:border-blue-500/30"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {c.nombre}
                            {coincide && (
                              <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                                Teléfono coincide
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.telefono || "—"} · {c.correo || "—"}
                          </p>
                        </div>
                        <Link2 className="h-4 w-4 text-primary shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
