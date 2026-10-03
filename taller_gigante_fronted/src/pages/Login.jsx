import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Campo from "../components/ui/Campo";
import Boton from "../components/ui/Boton";
import logo from "../assets/logo-oscuro.png";

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
        <img
          src={logo}
          alt="Taller Mecánico Gigante"
          className="animar-entrada mx-auto mb-10 w-64"
        />

        <section
          className="animar-entrada rounded-tarjeta border border-linea bg-tarjeta shadow-elevada"
          style={{ "--retraso": "120ms" }}
        >
          <h1 className="px-7 pt-7 text-3xl font-bold">Entrar</h1>
          <p className="px-7 pt-1 text-lg text-gris">Escriba su correo y su contraseña.</p>

          <form onSubmit={entrar} className="flex flex-col gap-5 p-7" noValidate>
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
                className="mt-2 flex min-h-12 items-center gap-2 text-lg font-bold text-rojo underline-offset-4 hover:underline"
              >
                {verContrasena ? <EyeOff aria-hidden="true" size={20} /> : <Eye aria-hidden="true" size={20} />}
                {verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
              </button>
            </div>

            {error && (
              <p role="alert" className="aparecer rounded-control border-2 border-rojo/30 bg-rojo/5 p-4 text-lg font-bold text-rojo">
                {error}
              </p>
            )}

            <Boton type="submit" icono={LogIn} anchoCompleto disabled={cargando}>
              {cargando ? "Entrando…" : "Entrar"}
            </Boton>
          </form>
        </section>
      </div>
    </main>
  );
}
