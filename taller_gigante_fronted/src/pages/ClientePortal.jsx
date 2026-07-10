import { useEffect, useState } from "react";
import {
  Wrench,
  UserCircle,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Car,
  ClipboardList,
  Phone,
  Mail as MailIcon,
  Loader2,
  Info,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

const estadoBadge = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

export default function ClientePortal() {
  const { theme, toggleTheme } = useTheme();
  const [nombre, setNombre] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setNombre(meta?.nombre || data.user?.email || "");
    });
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);

      const { data } = await supabase
        .from("clientes")
        .select(
          "id, nombre, telefono, correo, vehiculos(id, placa, marca, modelo, año, color, ordenes(id, estado, descripcion, diagnostico, costo_estimado, costo_final, fecha_ingreso, fecha_entrega))"
        )
        .maybeSingle();

      setCliente(data || null);
      setCargando(false);
    };

    cargarDatos();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#05070b] transition-colors duration-300">
      <header className="sticky top-0 z-20 h-20 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-wide text-zinc-900 dark:text-white">
              Taller Gigante
            </h1>
            <p className="text-xs text-zinc-500 dark:text-white/50">Portal de cliente</p>
          </div>
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            <UserCircle className="h-6 w-6 text-zinc-700 dark:text-white shrink-0" />
            <span className="hidden md:block text-sm text-zinc-900 dark:text-white truncate max-w-[10rem]">
              {nombre || "Cuenta"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-zinc-500 dark:text-white/50 transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />

              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 shadow-2xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/10 dark:border-white/10">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                    {nombre || "Cuenta"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-zinc-700 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 transition"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-yellow-300" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  {theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 dark:text-red-300 hover:bg-red-500/10 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
            {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-white/55">
            Consulta aquí el estado de tu vehículo y de tus órdenes de trabajo.
          </p>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-16 text-zinc-500 dark:text-white/50">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando tu información...
          </div>
        ) : !cliente ? (
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 mb-4">
              <Info className="h-6 w-6 text-blue-500 dark:text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
              Todavía no encontramos tu vehículo en el sistema
            </h3>
            <p className="text-sm text-zinc-500 dark:text-white/50 max-w-md mx-auto">
              Verifica que tu correo o teléfono coincidan con los que dejaste en el taller.
              Si el problema continúa, contacta directamente al taller para vincular tu cuenta.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-6 shadow-2xl shadow-black/5 dark:shadow-black/30">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
                Tus datos
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                  <UserCircle className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-white/45">Nombre</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {cliente.nombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                  <Phone className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-white/45">Teléfono</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {cliente.telefono || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
                  <MailIcon className="h-5 w-5 text-red-500 dark:text-red-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-500 dark:text-white/45">Correo</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                      {cliente.correo || "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(cliente.vehiculos || []).length === 0 ? (
              <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-10 text-center text-zinc-400 dark:text-white/40 text-sm">
                Todavía no tienes vehículos registrados en el taller.
              </div>
            ) : (
              cliente.vehiculos.map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] p-6 shadow-2xl shadow-black/5 dark:shadow-black/30"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Car className="h-5 w-5 text-blue-500 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white">
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.año ? `(${vehiculo.año})` : ""}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-white/45">
                        Placa {vehiculo.placa} {vehiculo.color ? `· ${vehiculo.color}` : ""}
                      </p>
                    </div>
                  </div>

                  {(vehiculo.ordenes || []).length === 0 ? (
                    <p className="text-sm text-zinc-400 dark:text-white/40 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Sin órdenes de trabajo registradas.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {vehiculo.ordenes.map((orden) => (
                        <div
                          key={orden.id}
                          className="rounded-2xl border border-black/10 dark:border-white/10 p-4"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-semibold text-zinc-900 dark:text-white">
                              #TG-{orden.id}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                estadoBadge[orden.estado] ||
                                "bg-black/5 dark:bg-white/10 text-zinc-600 dark:text-white/60"
                              }`}
                            >
                              {orden.estado}
                            </span>
                          </div>

                          {orden.descripcion && (
                            <p className="text-sm text-zinc-600 dark:text-white/60 mb-1">
                              {orden.descripcion}
                            </p>
                          )}

                          {orden.diagnostico && (
                            <p className="text-sm text-zinc-500 dark:text-white/45">
                              Diagnóstico: {orden.diagnostico}
                            </p>
                          )}

                          {(orden.costo_estimado || orden.costo_final) && (
                            <p className="text-sm text-zinc-500 dark:text-white/45 mt-1">
                              {orden.costo_final
                                ? `Costo final: ${orden.costo_final}`
                                : `Costo estimado: ${orden.costo_estimado}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}
