import {
  Users,
  Pencil,
  Trash2,
  Loader2,
  Link2,
  UserCheck,
  Lock,
  ShieldOff,
  ShieldCheck,
} from "lucide-react";

export function TablaClientes({
  clientes,
  loading,
  bloqueandoId,
  onEditar,
  onVincular,
  onToggleBloqueo,
  onEliminar,
}) {
  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando clientes...
        </div>
      ) : clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Users className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Todavía no hay clientes registrados.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/80 text-muted-foreground">
              <tr>
                <th className="text-left p-4">Nombre</th>
                <th className="text-left p-4">Teléfono</th>
                <th className="text-left p-4">Correo</th>
                <th className="text-left p-4">Dirección</th>
                <th className="text-left p-4">Ingreso</th>
                <th className="text-left p-4">Cuenta</th>
                <th className="text-right p-4">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-t border-foreground/10 hover:bg-card/40 transition"
                >
                  <td className="p-4 font-semibold text-foreground">
                    {cliente.nombre}
                    {cliente.bloqueado && (
                      <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 text-[10px] font-semibold align-middle">
                        <ShieldOff className="h-3 w-3" />
                        Bloqueado
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cliente.telefono || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cliente.correo || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cliente.direccion || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {cliente.fecha_ingreso
                      ? new Date(cliente.fecha_ingreso).toLocaleDateString("es-CR")
                      : "—"}
                  </td>
                  <td className="p-4">
                    {cliente.user_id ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 px-3 py-1 text-xs font-semibold">
                        <UserCheck className="h-3.5 w-3.5" />
                        Vinculada
                      </span>
                    ) : (
                      <button
                        onClick={() => onVincular(cliente)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-primary px-3 py-1.5 text-xs font-semibold hover:bg-blue-500/20 transition"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Vincular cuenta
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      {cliente.user_id ? (
                        <span
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/40 text-muted-foreground/50 cursor-not-allowed"
                          title="Este cliente ya está vinculado: sus datos de contacto los administra él mismo desde su portal."
                        >
                          <Lock className="h-4 w-4" />
                        </span>
                      ) : (
                        <button
                          onClick={() => onEditar(cliente)}
                          className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-blue-500/20 hover:border-blue-500/30 transition"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </button>
                      )}

                      <button
                        onClick={() => onToggleBloqueo(cliente)}
                        disabled={bloqueandoId === cliente.id}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl border transition disabled:opacity-60 ${
                          cliente.bloqueado
                            ? "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                            : "border-foreground/10 bg-card/60 hover:bg-yellow-500/20 hover:border-yellow-500/30"
                        }`}
                        title={
                          cliente.bloqueado
                            ? "Desbloquear cliente"
                            : "Bloquear cliente (perfil en revisión)"
                        }
                      >
                        {cliente.bloqueado ? (
                          <ShieldOff className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      <button
                        onClick={() => onEliminar(cliente)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 bg-card/60 hover:bg-red-500/20 hover:border-red-500/30 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-accent" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
