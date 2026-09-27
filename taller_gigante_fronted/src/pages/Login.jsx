import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Campo from "../components/ui/Campo";
import Boton from "../components/ui/Boton";
import logo from "../assets/logo-claro.png";

// Solo correo y contraseña. Nadie se registra solo: las cuentas las crea la
// dueña desde Supabase.

// Los errores de Supabase vienen en inglés; aquí se dicen claro y con qué hacer.
function mensajeLogin(error) {
  const mensaje = error?.message ?? "";
  if (mensaje.includes("Invalid login credentials")) {
    return "El correo o la contraseña no coinciden. Revise que estén bien escritos.";
  }
  if (mensaje.includes("Email not confirmed")) {
    return "Esta cuenta todavía no está confirmada. Busque el correo de confirmación en su bandeja.";
  }
  if (mensaje.includes("Failed to fetch") || mensaje.includes("NetworkError")) {
    return "No hay conexión con el sistema. Revise el internet e intente de nuevo.";
  }
  return "No se pudo entrar. Intente de nuevo en un momento.";
}

export default function Login() {
  const { user } = useAuth();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [verContrasena, setVerContrasena] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (user) return <Navigate to="/inicio" replace />;

  const entrar = async (e) => {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !contrasena) {
      setError("Escriba su correo y su contraseña.");
      return;
    }

    setCargando(true);
    const { error: errorLogin } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    });
    setCargando(false);

    // Si entra, AuthContext se entera solo y esta pantalla redirige.
    if (errorLogin) setError(mensajeLogin(errorLogin));
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="relative mx-auto mb-10 w-64">
          <span aria-hidden="true" className="absolute inset-0 -z-10 scale-125 rounded-full bg-rojo/25 blur-3xl" />
          <img src={logo} alt="Taller Mecánico Gigante" className="w-full" />
        </div>

        {/* Borde de luz rojo → azul alrededor del panel. */}
        <div className="relative rounded-panel bg-gradient-to-br from-rojo-vivo/60 via-white/10 to-azul-vivo/60 p-px shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)]">
          <EsquinasMando />
          <section className="rounded-[calc(var(--radius-panel)-1px)] bg-panel/95 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-6 py-4">
              <h1 className="rotulo text-lg text-texto">Entrar al sistema</h1>
              <span className="hidden items-center gap-2 text-base text-texto-2 sm:flex">
                <span aria-hidden="true" className="luz latido size-2 bg-emerald-400 text-emerald-400" />
                En línea
              </span>
            </div>

            <form onSubmit={entrar} className="flex flex-col gap-5 p-6" noValidate>
              <Campo
                etiqueta="Correo"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
              />

              <div>
                <Campo
                  etiqueta="Contraseña"
                  type={verContrasena ? "text" : "password"}
                  autoComplete="current-password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setVerContrasena((v) => !v)}
                  className="mt-2 flex min-h-12 items-center gap-2 text-base font-bold text-azul-vivo"
                >
                  {verContrasena ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
                  {verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
                </button>
              </div>

              {error && (
                <p role="alert" className="rounded-control border border-rojo-vivo/40 bg-rojo/15 p-4 text-lg text-texto">
                  {error}
                </p>
              )}

              <Boton type="submit" icono={LogIn} anchoCompleto disabled={cargando}>
                {cargando ? "Entrando…" : "Entrar"}
              </Boton>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

// Cuatro esquinas encendidas, como el visor de una pantalla de mando.
function EsquinasMando() {
  const base = "pointer-events-none absolute size-5 border-azul-vivo/80";
  return (
    <div aria-hidden="true">
      <span className={`${base} -top-2 -left-2 rounded-tl-lg border-t-2 border-l-2`} />
      <span className={`${base} -top-2 -right-2 rounded-tr-lg border-t-2 border-r-2`} />
      <span className={`${base} -bottom-2 -left-2 rounded-bl-lg border-b-2 border-l-2`} />
      <span className={`${base} -right-2 -bottom-2 rounded-br-lg border-r-2 border-b-2`} />
    </div>
  );
}
