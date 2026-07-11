import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import { UserCog, AlertCircle } from "lucide-react";

const rolLabels = {
  admin: "Administrador",
  demo: "Demo (solo lectura, datos enmascarados)",
  cliente: "Cliente",
};

export default function Usuarios() {
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cambiandoRolId, setCambiandoRolId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUsuarioActual(data.user);
      await fetchListaUsuarios();
      setCargando(false);
    });
  }, []);

  const fetchListaUsuarios = async () => {
    setError("");

    const { data, error: fetchError } = await supabase
      .from("usuarios")
      .select("id, nombre, correo, rol")
      .order("nombre");

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setListaUsuarios(data || []);
    }
  };

  const handleCambiarRol = async (usuarioId, nuevoRol) => {
    setError("");
    setCambiandoRolId(usuarioId);

    const { error: updateError } = await supabase
      .from("usuarios")
      .update({ rol: nuevoRol })
      .eq("id", usuarioId);

    setCambiandoRolId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setListaUsuarios((prev) =>
      prev.map((u) => (u.id === usuarioId ? { ...u, rol: nuevoRol } : u))
    );
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <UserCog className="h-6 w-6 text-primary" />
            Usuarios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Asigna el rol de administrador a otros usuarios del sistema
          </p>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 p-6">
          {error && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
              <AlertCircle className="h-5 w-5" />
              {error}
            </div>
          )}

          {cargando ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : listaUsuarios.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No se encontraron usuarios.
            </p>
          ) : (
            <div className="space-y-2">
              {listaUsuarios.map((u) => {
                const esUnoMismo = u.id === usuarioActual?.id;
                const bloqueado = esUnoMismo || u.rol === "demo";

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {u.nombre || "—"}{" "}
                        {esUnoMismo && (
                          <span className="text-xs text-muted-foreground font-normal">
                            (tú)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.correo}
                      </p>
                    </div>

                    {bloqueado ? (
                      <span className="shrink-0 text-xs font-medium text-muted-foreground rounded-lg border border-foreground/10 px-3 py-2">
                        {rolLabels[u.rol] || u.rol}
                      </span>
                    ) : (
                      <select
                        value={u.rol}
                        disabled={cambiandoRolId === u.id}
                        onChange={(e) => handleCambiarRol(u.id, e.target.value)}
                        className="shrink-0 text-sm font-medium bg-foreground/5 border border-foreground/15 text-foreground rounded-lg px-3 py-2 focus:outline-none focus:border-primary disabled:opacity-60"
                      >
                        <option value="cliente" className="bg-card text-foreground">Cliente</option>
                        <option value="admin" className="bg-card text-foreground">Administrador</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
