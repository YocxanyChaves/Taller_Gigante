import { useEffect, useState } from "react";
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
import ClientePortal from "./pages/ClientePortal";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = cargando
  const [rol, setRol] = useState(undefined); // undefined = no cargado aún

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setRol(undefined);
      return;
    }

    supabase
      .from("usuarios")
      .select("rol")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => {
        setRol(data?.rol || "cliente");
      });
  }, [session]);

  if (session === undefined || (session && rol === undefined)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">
        Cargando...
      </div>
    );
  }

  const protectAdmin = (element) => {
    if (!session) return <Login />;
    if (rol === "cliente") return <Navigate to="/portal" replace />;
    return element;
  };

  const protectCliente = (element) => {
    if (!session) return <Login />;
    if (rol !== "cliente") return <Navigate to="/dashboard" replace />;
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

        <Route path="/portal" element={protectCliente(<ClientePortal />)} />
      </Routes>
    </BrowserRouter>
  );
}
