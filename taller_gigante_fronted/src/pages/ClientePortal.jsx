import { useEffect, useState } from "react";
import {
  UserCircle,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Car,
  ClipboardList,
  Phone,
  Mail as MailIcon,
  MapPin,
  Loader2,
  Info,
  Pencil,
  X,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";
import { Logo } from "../components/Logo";

const estadoBadge = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

const emptyForm = { nombre: "", telefono: "", correo: "", direccion: "" };

export default function ClientePortal() {
  const { theme, toggleTheme } = useTheme();
  const [userId, setUserId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [cliente, setCliente] = useState(null);

  const [editando, setEditando] = useState(false);
  const [formEdit, setFormEdit] = useState(emptyForm);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [exitoPerfil, setExitoPerfil] = useState(false);

  const [solicitud, setSolicitud] = useState(null);
  const [cargandoSolicitud, setCargandoSolicitud] = useState(false);
  const [telefonoSolicitud, setTelefonoSolicitud] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;
      setUserId(user.id);

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", user.id)
        .maybeSingle();

      const meta = user.user_metadata;
      setNombre(
        perfil?.nombre ||
          meta?.nombre ||
          meta?.full_name ||
          meta?.name ||
          user.email ||
          ""
      );
    });
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const { data } = await supabase
      .from("clientes")
      .select(
        "id, nombre, telefono, correo, direccion, bloqueado, vehiculos(id, placa, marca, modelo, año, color, ordenes(id, estado, descripcion, diagnostico, costo_estimado, costo_final, fecha_ingreso, fecha_entrega))"
      )
      .maybeSingle();

    setCliente(data || null);
    setCargando(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (cargando || cliente || !userId) return;

    const cargarSolicitud = async () => {
      setCargandoSolicitud(true);
      const { data } = await supabase
        .from("solicitudes_vinculacion")
        .select("*")
        .eq("user_id", userId)
        .order("fecha_solicitud", { ascending: false })
        .limit(1)
        .maybeSingle();

      setSolicitud(data || null);
      setCargandoSolicitud(false);
    };

    cargarSolicitud();
  }, [cargando, cliente, userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const abrirEdicion = () => {
    setFormEdit({
      nombre: cliente?.nombre || "",
      telefono: cliente?.telefono || "",
      correo: cliente?.correo || "",
      direccion: cliente?.direccion || "",
    });
    setErrorPerfil("");
    setExitoPerfil(false);
    setEditando(true);
  };

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setGuardandoPerfil(true);
    setErrorPerfil("");
    setExitoPerfil(false);

    const { error } = await supabase
      .from("clientes")
      .update(formEdit)
      .eq("id", cliente.id);

    setGuardandoPerfil(false);

    if (error) {
      setErrorPerfil(error.message);
      return;
    }

    setExitoPerfil(true);
    setEditando(false);
    cargarDatos();
  };

  const enviarSolicitud = async (e) => {
    e.preventDefault();
    setEnviandoSolicitud(true);
    setErrorSolicitud("");

    const { error } = await supabase.from("solicitudes_vinculacion").insert({
      user_id: userId,
      telefono_ingresado: telefonoSolicitud,
    });

    setEnviandoSolicitud(false);

    if (error) {
      setErrorSolicitud(error.message);
      return;
    }

    setTelefonoSolicitud("");
    const { data } = await supabase
      .from("solicitudes_vinculacion")
      .select("*")
      .eq("user_id", userId)
      .order("fecha_solicitud", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSolicitud(data || null);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <header className="sticky top-0 z-20 h-20 border-b border-foreground/10 bg-card/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Logo className="h-16 w-auto" />
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-foreground/10 bg-card/60 px-3 py-2 hover:bg-foreground/5 transition"
          >
            <UserCircle className="h-6 w-6 text-foreground shrink-0" />
            <span className="hidden md:block text-sm text-foreground truncate max-w-[10rem]">
              {nombre || "Cuenta"}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />

              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-foreground/10 bg-card shadow-2xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-foreground/10">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {nombre || "Cuenta"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    toggleTheme();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground/80 hover:bg-foreground/5 transition"
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
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-accent hover:bg-red-500/10 transition"
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
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Consulta aquí el estado de tu vehículo y de tus órdenes de trabajo.
          </p>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-foreground/10 bg-card/60 p-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando tu información...
          </div>
        ) : cliente?.bloqueado ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/15 border border-yellow-500/30 mb-4">
              <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Tu perfil está en revisión
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Por ahora no podemos mostrarte la información de tu vehículo.
              Comunícate con el taller si tienes dudas.
            </p>
          </div>
        ) : !cliente ? (
          <div className="rounded-3xl border border-foreground/10 bg-card/60 p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/15 border border-blue-500/30 mb-4">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                Todavía no encontramos tu vehículo en el sistema
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Solicita la vinculación de tu cuenta con tu número de teléfono
                y un administrador del taller la va a revisar.
              </p>
            </div>

            {cargandoSolicitud ? (
              <div className="flex items-center justify-center gap-3 py-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Cargando...
              </div>
            ) : solicitud?.estado === "pendiente" ? (
              <div className="max-w-md mx-auto rounded-2xl border border-foreground/10 bg-card/60 p-5 flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Tu solicitud está pendiente de revisión
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviaste el número {solicitud.telefono_ingresado}. Un
                    administrador la va a revisar pronto.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                {solicitud?.estado === "rechazada" && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Tu solicitud anterior fue rechazada
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {solicitud.comentario_admin ||
                          "Verifica el número e intenta de nuevo, o contacta al taller."}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={enviarSolicitud} className="space-y-3">
                  {errorSolicitud && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorSolicitud}
                    </div>
                  )}

                  <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                    <Phone className="h-4 w-4 text-primary" />
                    Tu número de teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={telefonoSolicitud}
                    onChange={(e) => setTelefonoSolicitud(e.target.value)}
                    placeholder="+506 8888-8888"
                    className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                  />

                  <button
                    type="submit"
                    disabled={enviandoSolicitud}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {enviandoSolicitud ? "Enviando..." : "Solicitar vinculación"}
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Tus datos
                </h3>

                {!editando && (
                  <button
                    onClick={abrirEdicion}
                    className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-card/60 px-3 py-2 text-sm text-foreground hover:bg-foreground/5 transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                )}
              </div>

              {exitoPerfil && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Tus datos se actualizaron correctamente.
                </div>
              )}

              {editando ? (
                <form onSubmit={guardarPerfil} className="space-y-4">
                  {errorPerfil && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {errorPerfil}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <UserCircle className="h-4 w-4 text-accent" />
                        Nombre
                      </label>
                      <input
                        type="text"
                        required
                        value={formEdit.nombre}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, nombre: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formEdit.telefono}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, telefono: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <MailIcon className="h-4 w-4 text-accent" />
                        Correo
                      </label>
                      <input
                        type="email"
                        value={formEdit.correo}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, correo: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2 text-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={formEdit.direccion}
                        onChange={(e) =>
                          setFormEdit({ ...formEdit, direccion: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={guardandoPerfil}
                      className="flex-1 py-3 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all disabled:opacity-60"
                    >
                      {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(false)}
                      className="px-5 py-3 rounded-xl border border-foreground/10 text-foreground hover:bg-foreground/5 transition flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                    <UserCircle className="h-5 w-5 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Nombre</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cliente.nombre}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cliente.telefono || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4">
                    <MailIcon className="h-5 w-5 text-accent shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Correo</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cliente.correo || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 p-4 sm:col-span-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {cliente.direccion || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(cliente.vehiculos || []).length === 0 ? (
              <div className="rounded-3xl border border-foreground/10 bg-card/60 p-10 text-center text-muted-foreground/70 text-sm">
                Todavía no tienes vehículos registrados en el taller.
              </div>
            ) : (
              cliente.vehiculos.map((vehiculo) => (
                <div
                  key={vehiculo.id}
                  className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-11 w-11 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">
                        {vehiculo.marca} {vehiculo.modelo} {vehiculo.año ? `(${vehiculo.año})` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Placa {vehiculo.placa} {vehiculo.color ? `· ${vehiculo.color}` : ""}
                      </p>
                    </div>
                  </div>

                  {(vehiculo.ordenes || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground/70 flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Sin órdenes de trabajo registradas.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {vehiculo.ordenes.map((orden) => (
                        <div
                          key={orden.id}
                          className="rounded-2xl border border-foreground/10 p-4"
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <p className="font-semibold text-foreground">
                              #TG-{orden.id}
                            </p>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                estadoBadge[orden.estado] ||
                                "bg-foreground/5 text-muted-foreground"
                              }`}
                            >
                              {orden.estado}
                            </span>
                          </div>

                          {orden.descripcion && (
                            <p className="text-sm text-muted-foreground mb-1">
                              {orden.descripcion}
                            </p>
                          )}

                          {orden.diagnostico && (
                            <p className="text-sm text-muted-foreground">
                              Diagnóstico: {orden.diagnostico}
                            </p>
                          )}

                          {(orden.costo_estimado || orden.costo_final) && (
                            <p className="text-sm text-muted-foreground mt-1">
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
