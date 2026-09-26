import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Único lugar que sabe quién inició sesión y con qué rol. El rol sale de la
// tabla `usuarios` (nunca de la metadata de la cuenta, que la controla quien
// se registra).

const AuthContext = createContext(null);

// Nombre para mostrar: el de `usuarios` y, si no hay, el que trae la cuenta
// (registro con correo, Google, etc.).
function nombreParaMostrar(user, perfil) {
  const meta = user?.user_metadata;
  return (
    perfil?.nombre ||
    meta?.nombre ||
    meta?.full_name ||
    meta?.name ||
    user?.email ||
    ""
  );
}

async function consultarPerfil(userId) {
  const { data } = await supabase
    .from("usuarios")
    .select("nombre, correo, rol")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = cargando
  // Fila de `usuarios` junto con el id al que pertenece, para saber si ya
  // corresponde a la sesión actual o todavía se está cargando.
  const [perfil, setPerfil] = useState({ userId: null, datos: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (evento, nuevaSesion) => {
        setSession(nuevaSesion);

        if (evento === "SIGNED_IN") {
          sessionStorage.removeItem("dekra_firma_cerrada");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) return;
    let cancelado = false;

    consultarPerfil(userId).then((datos) => {
      if (!cancelado) setPerfil({ userId, datos });
    });

    return () => {
      cancelado = true;
    };
  }, [userId]);

  const user = session?.user ?? null;
  const perfilActual = perfil.userId === userId ? perfil.datos : null;
  // Sin fila o sin rol conocido = 'pendiente': no ve nada.
  const rol = user ? perfilActual?.rol || "pendiente" : null;
  const loading =
    session === undefined || (userId !== null && perfil.userId !== userId);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const value = {
    user,
    rol,
    nombre: nombreParaMostrar(user, perfilActual),
    loading,
    esAdmin: rol === "admin",
    esDemo: rol === "demo",
    tieneAcceso: rol === "admin" || rol === "demo",
    cerrarSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
