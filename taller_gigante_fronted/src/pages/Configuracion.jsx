import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import {
  Settings,
  User,
  Mail,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const rolLabels = {
  admin: "Administrador",
  demo: "Demo (solo lectura, datos enmascarados)",
  cliente: "Cliente",
};

export default function Configuracion() {
  const { theme, toggleTheme } = useTheme();

  const [usuario, setUsuario] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [exitoPassword, setExitoPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      setCargandoUsuario(false);
    });
  }, []);

  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPassword("");
    setExitoPassword(false);

    if (nuevaPassword !== confirmarPassword) {
      setErrorPassword("Las contraseñas no coinciden.");
      return;
    }

    if (nuevaPassword.length < 6) {
      setErrorPassword("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setGuardandoPassword(true);

    const { error } = await supabase.auth.updateUser({
      password: nuevaPassword,
    });

    setGuardandoPassword(false);

    if (error) {
      setErrorPassword(error.message);
      return;
    }

    setExitoPassword(true);
    setNuevaPassword("");
    setConfirmarPassword("");
  };

  const rol = usuario?.user_metadata?.rol || "—";
  const nombre = usuario?.user_metadata?.nombre || "—";

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-zinc-900 dark:text-white">
            <Settings className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            Configuración
          </h1>
          <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
            Preferencias de tu cuenta y del sistema
          </p>
        </div>

        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] shadow-2xl shadow-black/5 dark:shadow-black/30 p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
            Tu cuenta
          </h2>

          {cargandoUsuario ? (
            <p className="text-sm text-zinc-500 dark:text-white/50">
              Cargando...
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                <User className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-white/45">
                    Nombre
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                <Mail className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-white/45">
                    Correo
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {usuario?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                <ShieldCheck className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-white/45">
                    Rol
                  </p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {rolLabels[rol] || rol}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] shadow-2xl shadow-black/5 dark:shadow-black/30 p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Apariencia
          </h2>
          <p className="text-sm text-zinc-500 dark:text-white/45 mb-4">
            Cambia entre modo claro y oscuro
          </p>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4 hover:bg-black/5 dark:hover:bg-white/[0.06] transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/30 flex items-center justify-center">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-blue-400" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Modo {theme === "dark" ? "oscuro" : "claro"}
                </p>
                <p className="text-xs text-zinc-500 dark:text-white/45">
                  Toca para cambiar a modo {theme === "dark" ? "claro" : "oscuro"}
                </p>
              </div>
            </div>

            <div
              className={`relative h-7 w-12 rounded-full transition-colors ${
                theme === "dark" ? "bg-blue-600" : "bg-zinc-300"
              }`}
            >
              <div
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>

        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] shadow-2xl shadow-black/5 dark:shadow-black/30 p-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
            Seguridad
          </h2>
          <p className="text-sm text-zinc-500 dark:text-white/45 mb-4">
            Cambia tu contraseña
          </p>

          {errorPassword && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
              <AlertCircle className="h-5 w-5" />
              {errorPassword}
            </div>
          )}

          {exitoPassword && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              Contraseña actualizada correctamente.
            </div>
          )}

          <form
            onSubmit={handleCambiarPassword}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-900 dark:text-white">
                <Lock className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                Nueva contraseña
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-blue-400"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-zinc-900 dark:text-white">
                <Lock className="h-4 w-4 text-red-500 dark:text-red-400" />
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-black/[0.03] dark:bg-black/30 border border-black/10 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                placeholder="Repite la contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={guardandoPassword}
              className="sm:col-span-2 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
            >
              {guardandoPassword ? "Guardando..." : "Actualizar contraseña"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
