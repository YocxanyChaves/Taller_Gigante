import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Vehiculos from "./pages/Vehiculos";
import Ordenes from "./pages/Ordenes";
import Historial from "./pages/Historial";
import Configuracion from "./pages/Configuracion";
import Usuarios from "./pages/Usuarios";
import ClientePortal from "./pages/ClientePortal";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { user, rol, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Cargando...
      </div>
    );
  }

  const protectAdmin = (element) => {
    if (!user) return <Login />;
    if (rol === "cliente") return <Navigate to="/portal" replace />;
    return element;
  };

  const protectCliente = (element) => {
    if (!user) return <Login />;
    if (rol !== "cliente") return <Navigate to="/dashboard" replace />;
    return element;
  };

  const protectSoloAdmin = (element) => {
    if (!user) return <Login />;
    if (rol !== "admin") return <Navigate to="/dashboard" replace />;
    return element;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/dashboard" element={protectAdmin(<Dashboard />)} />
        <Route path="/clientes" element={protectAdmin(<Clientes />)} />
        <Route path="/vehiculos" element={protectAdmin(<Vehiculos />)} />
        <Route path="/ordenes" element={protectAdmin(<Ordenes />)} />
        <Route path="/historial" element={protectAdmin(<Historial />)} />
        <Route path="/configuracion" element={protectAdmin(<Configuracion />)} />
        <Route path="/usuarios" element={protectSoloAdmin(<Usuarios />)} />

        <Route path="/portal" element={protectCliente(<ClientePortal />)} />
      </Routes>
    </BrowserRouter>
  );
}
