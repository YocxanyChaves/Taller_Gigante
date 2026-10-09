import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Marco from "./components/layout/Marco";
import Login from "./pages/Login";
import SinAcceso from "./pages/SinAcceso";
import Inicio from "./pages/Inicio";
import Trabajos from "./pages/Trabajos";
import NuevoTrabajo from "./pages/NuevoTrabajo";
import Trabajo from "./pages/Trabajo";
import TrabajoPublico from "./pages/TrabajoPublico";
import Clientes from "./pages/Clientes";
import Cliente from "./pages/Cliente";
import Cobros from "./pages/Cobros";
import NoEncontrada from "./pages/NoEncontrada";

// "Cómo va el taller" lleva el gráfico (Chart.js, pesado): se baja solo al abrirla.
const Taller = lazy(() => import("./pages/Taller"));

// Pantallas con sesión: sin sesión va al login; con cuenta 'pendiente', a
// "Su cuenta todavía no tiene acceso".
function ConSesion() {
  const { user, tieneAcceso } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!tieneAcceso) return <SinAcceso />;
  return <Outlet />;
}

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-2xl text-gris">
        Cargando…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Página del cliente: sin cuenta, desde el link que le manda el taller. */}
        <Route path="/t/:token" element={<TrabajoPublico />} />

        <Route element={<ConSesion />}>
          <Route element={<Marco />}>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/trabajos" element={<Trabajos />} />
            <Route path="/trabajos/nuevo" element={<NuevoTrabajo />} />
            <Route path="/trabajos/:id" element={<Trabajo />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes/:id" element={<Cliente />} />
            <Route path="/cobros" element={<Cobros />} />
            <Route
              path="/taller"
              element={
                <Suspense fallback={<p className="animate-pulse text-xl text-gris">Cargando…</p>}>
                  <Taller />
                </Suspense>
              }
            />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
