import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Marco from "./components/layout/Marco";
import Login from "./pages/Login";
import SinAcceso from "./pages/SinAcceso";
import Inicio from "./pages/Inicio";
import Trabajos from "./pages/Trabajos";
import NuevoTrabajo from "./pages/NuevoTrabajo";
import Clientes from "./pages/Clientes";
import Cobros from "./pages/Cobros";
import Estilos from "./pages/Estilos";
import NoEncontrada from "./pages/NoEncontrada";

// Pantallas con sesión: sin sesión va al login; con cuenta 'pendiente', a
// "Su cuenta todavía no tiene acceso".
function ConSesion() {
  const { user, tieneAcceso } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!tieneAcceso) return <SinAcceso />;
  return <Outlet />;
}

function SoloAdmin() {
  const { esAdmin } = useAuth();
  return esAdmin ? <Outlet /> : <Navigate to="/inicio" replace />;
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

        <Route element={<ConSesion />}>
          <Route element={<Marco />}>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<Inicio />} />
            <Route path="/trabajos" element={<Trabajos />} />
            <Route path="/trabajos/nuevo" element={<NuevoTrabajo />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/cobros" element={<Cobros />} />
            <Route element={<SoloAdmin />}>
              <Route path="/estilos" element={<Estilos />} />
            </Route>
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
