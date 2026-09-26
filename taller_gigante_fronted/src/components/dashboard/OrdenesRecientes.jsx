const estadoBadge = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export function OrdenesRecientes({ ordenes }) {
  return (
    <div className="xl:col-span-2 rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">Órdenes recientes</h2>
          <p className="text-sm text-muted-foreground">
            Últimos trabajos registrados en el sistema
          </p>
        </div>

        <a
          href="/ordenes"
          className="rounded-xl bg-foreground/5 px-4 py-2 text-sm text-foreground hover:bg-foreground/10 transition"
        >
          Ver todas
        </a>
      </div>

      {ordenes.length === 0 ? (
        <div className="rounded-2xl border border-foreground/10 p-10 text-center text-muted-foreground/70 text-sm">
          Todavía no hay órdenes registradas.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-foreground/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-card/80 text-muted-foreground">
                <tr>
                  <th className="text-left p-4">Orden</th>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-left p-4">Vehículo</th>
                  <th className="text-left p-4">Estado</th>
                </tr>
              </thead>

              <tbody>
                {ordenes.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-t border-foreground/10 hover:bg-card/40 transition"
                  >
                    <td className="p-4 font-semibold text-foreground">#TG-{orden.id}</td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos?.clientes?.nombre || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos?.placa || "—"}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          estadoBadge[orden.estado] || "bg-foreground/5 text-muted-foreground"
                        }`}
                      >
                        {orden.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
