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
  Pencil,
} from "lucide-react";

const rolLabels = {
  admin: "Administrador",
  demo: "Demo (solo lectura, datos enmascarados)",
  cliente: "Cliente",
};

export default function Configuracion() {
  const { theme, toggleTheme } = useTheme();

  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  const [editandoCuenta, setEditandoCuenta] = useState(false);
  const [nombreEdit, setNombreEdit] = useState("");
  const [correoEdit, setCorreoEdit] = useState("");
  const [guardandoCuenta, setGuardandoCuenta] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState("");
  const [exitoCuenta, setExitoCuenta] = useState("");

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPassword, setGuardandoPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState("");
  const [exitoPassword, setExitoPassword] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUsuario(data.user);

      if (data.user) {
        const { data: fila } = await supabase
          .from("usuarios")
          .select("nombre, rol")
          .eq("id", data.user.id)
          .maybeSingle();
        setPerfil(fila || null);
      }

      setCargandoUsuario(false);
    });
  }, []);

  const rol = perfil?.rol || usuario?.user_metadata?.rol || "—";
  const nombre =
    perfil?.nombre ||
    usuario?.user_metadata?.nombre ||
    usuario?.user_metadata?.full_name ||
    usuario?.user_metadata?.name ||
    "—";

  const abrirEdicionCuenta = () => {
    setNombreEdit(nombre === "—" ? "" : nombre);
    setCorreoEdit(usuario?.email || "");
    setErrorCuenta("");
    setExitoCuenta("");
    setEditandoCuenta(true);
  };

  const handleGuardarCuenta = async (e) => {
    e.preventDefault();
    setErrorCuenta("");
    setExitoCuenta("");
    setGuardandoCuenta(true);

    const nombreCambio = nombreEdit.trim() !== nombre;
    const correoCambio = correoEdit.trim() !== usuario?.email;

    if (nombreCambio) {
      const { error: nombreError } = await supabase
        .from("usuarios")
        .update({ nombre: nombreEdit.trim() })
        .eq("id", usuario.id);

      if (nombreError) {
        setGuardandoCuenta(false);
        setErrorCuenta(nombreError.message);
        return;
      }

      setPerfil((prev) => ({ ...(prev || {}), nombre: nombreEdit.trim() }));
    }

    if (correoCambio) {
      const { error: correoError } = await supabase.auth.updateUser({
        email: correoEdit.trim(),
      });

      if (correoError) {
        setGuardandoCuenta(false);
        setErrorCuenta(correoError.message);
        return;
      }
    }

    setGuardandoCuenta(false);
    setEditandoCuenta(false);

    if (correoCambio) {
      setExitoCuenta(
        "Nombre actualizado. Para el correo te enviamos un enlace de confirmación: revisa tu bandeja de entrada para completar el cambio."
      );
    } else {
      setExitoCuenta("Datos actualizados correctamente.");
    }
  };

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

  const puedeEditarCuenta = rol === "admin";

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
            <Settings className="h-6 w-6 text-primary" />
            Configuración
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Preferencias de tu cuenta y del sistema
          </p>
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Tu cuenta</h2>

            {puedeEditarCuenta && !cargandoUsuario && !editandoCuenta && (
              <button
                onClick={abrirEdicionCuenta}
                className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </button>
            )}
          </div>

          {errorCuenta && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
              <AlertCircle className="h-5 w-5" />
              {errorCuenta}
            </div>
          )}

          {exitoCuenta && !editandoCuenta && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {exitoCuenta}
            </div>
          )}

          {cargandoUsuario ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : editandoCuenta ? (
            <form onSubmit={handleGuardarCuenta} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-accent" />
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nombreEdit}
                    onChange={(e) => setNombreEdit(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <Mail className="h-4 w-4 text-primary" />
                    Correo
                  </label>
                  <input
                    type="email"
                    value={correoEdit}
                    onChange={(e) => setCorreoEdit(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={guardandoCuenta}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
                >
                  {guardandoCuenta ? "Guardando..." : "Guardar cambios"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoCuenta(false)}
                  disabled={guardandoCuenta}
                  className="px-6 py-3 border border-foreground/10 rounded-xl font-semibold text-foreground hover:bg-foreground/5 transition disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                <User className="h-5 w-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Nombre</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {nombre}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {usuario?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Rol</p>
                  <p className="text-sm font-semibold text-foreground truncate">
                    {rolLabels[rol] || rol}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 p-6">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Apariencia
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cambia entre modo claro y oscuro
          </p>

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between rounded-2xl border border-foreground/10 bg-card/60 p-4 hover:bg-foreground/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl border border-foreground/10 bg-card flex items-center justify-center">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 text-blue-400" />
                ) : (
                  <Sun className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  Modo {theme === "dark" ? "oscuro" : "claro"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Toca para cambiar a modo {theme === "dark" ? "claro" : "oscuro"}
                </p>
              </div>
            </div>

            <div
              className={`relative h-7 w-12 rounded-full transition-colors ${
                theme === "dark" ? "bg-primary" : "bg-foreground/20"
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

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 p-6">
          <h2 className="text-lg font-bold text-foreground mb-1">
            Seguridad
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Cambia tu contraseña
          </p>

          {errorPassword && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
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
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4 text-primary" />
                Nueva contraseña
              </label>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4 text-accent" />
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-accent"
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
