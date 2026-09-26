import { useEffect, useState } from "react";
import { Info, Loader2, Clock, XCircle, AlertCircle, Phone, Send } from "lucide-react";
import { ultimaSolicitud, enviarSolicitud } from "../../services/portal";
import { mensajeError } from "../../lib/errores";

// Lo que ve una cuenta que todavía no está vinculada a ninguna ficha.
export function SolicitarVinculacion({ userId }) {
  const [solicitud, setSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    ultimaSolicitud(userId).then((data) => {
      setSolicitud(data);
      setCargando(false);
    });
  }, [userId]);

  const handleEnviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setError("");

    const { error: envioError } = await enviarSolicitud(userId, telefono);

    setEnviando(false);

    if (envioError) {
      setError(mensajeError(envioError));
      return;
    }

    setTelefono("");
    setSolicitud(await ultimaSolicitud(userId));
  };

  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 p-8">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 mb-4">
          <Info className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-2">
          Todavía no encontramos tu vehículo en el sistema
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Solicita la vinculación de tu cuenta con tu número de teléfono y un
          administrador del taller la va a revisar.
        </p>
      </div>

      {cargando ? (
        <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando...
        </div>
      ) : solicitud?.estado === "pendiente" ? (
        <div className="max-w-md mx-auto rounded-2xl border border-foreground/10 bg-card/60 p-5 flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Tu solicitud está pendiente de revisión
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Enviaste el número {solicitud.telefono_ingresado}. Un administrador
              la va a revisar pronto.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          {solicitud?.estado === "rechazada" && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Tu solicitud anterior fue rechazada
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {solicitud.comentario_admin ||
                    "Verifica el número e intenta de nuevo, o contacta al taller."}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleEnviar} className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <label className="text-sm font-medium flex items-center gap-2 text-foreground">
              <Phone className="h-4 w-4 text-primary" />
              Tu número de teléfono
            </label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+506 8888-8888"
              className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
            />

            <button
              type="submit"
              disabled={enviando}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {enviando ? "Enviando..." : "Solicitar vinculación"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
