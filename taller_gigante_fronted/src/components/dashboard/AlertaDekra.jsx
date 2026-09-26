import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react";

// Aviso de vehículos que deben pasar la revisión técnica pronto.
export function AlertaDekra({ alertas, marcandoId, onMarcarHecha, onCerrar }) {
  const plural = alertas.length !== 1;

  return (
    <section className="relative rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
      <button
        onClick={onCerrar}
        title="Cerrar aviso"
        className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2.5 mb-3 pr-8">
        <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 text-accent" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Revisión técnica (DEKRA) próxima
          </h2>
          <p className="text-xs text-muted-foreground">
            {alertas.length} vehículo{plural ? "s" : ""} debe{plural ? "n" : ""} pasar
            la revisión pronto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
        {alertas.map((v) => (
          <div
            key={v.id}
            className="relative rounded-xl border border-red-500/10 bg-card/40 px-3.5 py-2.5 pr-9"
          >
            <button
              onClick={() => onMarcarHecha(v.id)}
              disabled={marcandoId === v.id}
              title="Marcar revisión como hecha"
              className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-300 transition disabled:opacity-50"
            >
              {marcandoId === v.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </button>

            <p className="text-sm font-semibold text-foreground">
              {v.placa}
              {(v.marca || v.modelo) && (
                <span className="font-normal text-muted-foreground">
                  {" "}
                  · {[v.marca, v.modelo].filter(Boolean).join(" ")}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground">
              {v.clientes?.nombre || "Sin cliente asignado"}
            </p>
            <p className="text-xs font-semibold text-accent mt-0.5 capitalize">
              {v.nombreMes} · vence en {v.diasParaVencer} día
              {v.diasParaVencer === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
