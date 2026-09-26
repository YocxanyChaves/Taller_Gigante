import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { StatCard } from "../components/dashboard/StatCard";
import { supabase } from "../lib/supabaseClient";
import {
    Car,
    ClipboardList,
    Users,
    DollarSign,
    Activity,
    CheckCircle2,
    Clock,
    Loader2,
    AlertTriangle,
    X,
    } from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";
import { calcularEstadoDekra } from "../lib/dekra";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const estadoBadge = {
  Completado: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
  "En proceso": "bg-blue-500/15 text-blue-600 dark:text-blue-300",
  Pendiente: "bg-red-500/15 text-red-600 dark:text-red-300",
};

function parseMonto(valor) {
  if (!valor) return 0;
  const limpio = String(valor).replace(/[^0-9.-]/g, "");
  const numero = parseFloat(limpio);
  return Number.isNaN(numero) ? 0 : numero;
}

function formatMonto(numero) {
  return `₡${numero.toLocaleString("es-CR", { maximumFractionDigits: 0 })}`;
}

function firmaDeAlertas(alertas) {
  return alertas
    .map((a) => a.id)
    .sort((a, b) => a - b)
    .join(",");
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [ordenesRecientes, setOrdenesRecientes] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [actividad, setActividad] = useState([]);
  const [nombre, setNombre] = useState("");
  const [alertasDekra, setAlertasDekra] = useState([]);
  const [firmaAlertaCerrada, setFirmaAlertaCerrada] = useState(
    () => sessionStorage.getItem("dekra_firma_cerrada") || ""
  );
  const [marcandoDekraId, setMarcandoDekraId] = useState(null);

  const cerrarAlertaDekra = () => {
    const firma = firmaDeAlertas(alertasDekra);
    sessionStorage.setItem("dekra_firma_cerrada", firma);
    setFirmaAlertaCerrada(firma);
  };

  const marcarDekraHecha = async (vehiculoId) => {
    setMarcandoDekraId(vehiculoId);

    const hoyISO = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("vehiculos")
      .update({ ultima_revision_tecnica: hoyISO })
      .eq("id", vehiculoId);

    setMarcandoDekraId(null);

    if (error) return;

    setAlertasDekra((prev) => prev.filter((v) => v.id !== vehiculoId));
  };

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;

      const { data: perfil } = await supabase
        .from("usuarios")
        .select("nombre")
        .eq("id", user.id)
        .maybeSingle();

      const meta = user.user_metadata;
      const nombreCompleto =
        perfil?.nombre ||
        meta?.nombre ||
        meta?.full_name ||
        meta?.name ||
        user.email ||
        "";
      setNombre(nombreCompleto.split(" ")[0] || nombreCompleto);
    });
  }, []);

  useEffect(() => {
    const cargarDashboard = async () => {
      setLoading(true);

      const inicioMes = new Date();
      inicioMes.setDate(1);
      inicioMes.setHours(0, 0, 0, 0);

      const haceSieteDias = new Date();
      haceSieteDias.setDate(haceSieteDias.getDate() - 6);
      haceSieteDias.setHours(0, 0, 0, 0);

      const [
        { count: totalVehiculos },
        { count: totalClientes },
        { count: ordenesPendientes },
        { count: ordenesEnProceso },
        { data: ordenesDelMes },
        { data: ultimasOrdenes },
        { data: ordenesSemana },
        { data: ultimoCliente },
        { data: vehiculosDekra },
      ] = await Promise.all([
        supabase.from("vehiculos").select("*", { count: "exact", head: true }),
        supabase.from("clientes").select("*", { count: "exact", head: true }),
        supabase
          .from("ordenes")
          .select("*", { count: "exact", head: true })
          .eq("estado", "Pendiente"),
        supabase
          .from("ordenes")
          .select("*", { count: "exact", head: true })
          .eq("estado", "En proceso"),
        supabase
          .from("ordenes")
          .select("costo_final, fecha_entrega")
          .gte("fecha_entrega", inicioMes.toISOString()),
        supabase
          .from("ordenes")
          .select(
            "id, estado, fecha_ingreso, vehiculos(placa, marca, modelo, clientes(nombre))"
          )
          .order("id", { ascending: false })
          .limit(5),
        supabase
          .from("ordenes")
          .select("id, fecha_ingreso")
          .gte("fecha_ingreso", haceSieteDias.toISOString()),
        supabase
          .from("clientes")
          .select("nombre, fecha_ingreso")
          .order("fecha_ingreso", { ascending: false })
          .limit(1),
        supabase
          .from("vehiculos")
          .select(
            "id, placa, marca, modelo, ultima_revision_tecnica, clientes(nombre)"
          ),
      ]);

      const ingresosMes = (ordenesDelMes || []).reduce(
        (acc, o) => acc + parseMonto(o.costo_final),
        0
      );

      setStats([
        {
          title: "Vehículos activos",
          value: String(totalVehiculos ?? 0),
          change: "Registrados en el taller",
          icon: Car,
          color: "blue",
        },
        {
          title: "Órdenes pendientes",
          value: String(ordenesPendientes ?? 0),
          change: `${ordenesEnProceso ?? 0} en proceso`,
          icon: ClipboardList,
          color: "red",
        },
        {
          title: "Clientes registrados",
          value: String(totalClientes ?? 0),
          change: "Base total de clientes",
          icon: Users,
          color: "blue",
        },
        {
          title: "Ingresos del mes",
          value: formatMonto(ingresosMes),
          change: `${(ordenesDelMes || []).length} órdenes entregadas`,
          icon: DollarSign,
          color: "red",
        },
      ]);

      setOrdenesRecientes(ultimasOrdenes || []);

      const conteoPorDia = {};
      (ordenesSemana || []).forEach((o) => {
        const dia = DIAS[new Date(o.fecha_ingreso).getDay()];
        conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
      });

      const hoy = new Date();
      const serieSemana = [];
      for (let i = 6; i >= 0; i--) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() - i);
        const dia = DIAS[fecha.getDay()];
        serieSemana.push({ day: dia, orders: conteoPorDia[dia] || 0 });
      }
      setChartData(serieSemana);

      const eventos = [];
      if (ultimoCliente && ultimoCliente[0]) {
        eventos.push({
          icon: Users,
          title: "Cliente registrado",
          text: `Se agregó a ${ultimoCliente[0].nombre} como cliente.`,
        });
      }
      if (ultimasOrdenes && ultimasOrdenes[0]) {
        const o = ultimasOrdenes[0];
        eventos.push({
          icon: o.estado === "Completado" ? CheckCircle2 : Clock,
          title:
            o.estado === "Completado"
              ? "Orden completada"
              : "Orden reciente",
          text: `${o.vehiculos?.placa || "Vehículo"} está en estado "${
            o.estado
          }".`,
        });
      }
      const completada = (ultimasOrdenes || []).find(
        (o) => o.estado === "Completado"
      );
      if (completada) {
        eventos.push({
          icon: CheckCircle2,
          title: "Orden completada",
          text: `${completada.vehiculos?.placa || "Vehículo"} fue marcado como entregado.`,
        });
      }
      setActividad(eventos.slice(0, 3));

      const alertas = (vehiculosDekra || [])
        .map((v) => {
          const estado = calcularEstadoDekra(v.placa, v.ultima_revision_tecnica);
          return estado && estado.dentroDeVentana
            ? { ...v, ...estado }
            : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.diasParaVencer - b.diasParaVencer);
      setAlertasDekra(alertas);

      setLoading(false);
    };

    cargarDashboard();
  }, []);

  return (
    <Layout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-foreground/[0.05] to-transparent p-8 shadow-2xl shadow-black/5">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card/60 px-4 py-2 text-sm text-foreground/80">
              <Activity className="h-4 w-4 text-accent" />
              Sistema operativo en tiempo real
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
            </h1>

            <p className="mt-4 text-muted-foreground max-w-2xl">
              Panel inteligente del taller
            </p>
          </div>
        </section>

        {!loading &&
          alertasDekra.length > 0 &&
          firmaDeAlertas(alertasDekra) !== firmaAlertaCerrada && (
          <section className="relative rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-4">
            <button
              onClick={cerrarAlertaDekra}
              title="Cerrar aviso"
              className="absolute top-3 right-3 rounded-lg p-1.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3 pr-8">
              <div className="h-7 w-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-3.5 w-3.5 text-accent" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Revisión técnica (DEKRA) próxima
                </h2>
                <p className="text-xs text-muted-foreground">
                  {alertasDekra.length} vehículo
                  {alertasDekra.length === 1 ? "" : "s"} debe
                  {alertasDekra.length === 1 ? "" : "n"} pasar la revisión pronto
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
              {alertasDekra.map((v) => (
                <div
                  key={v.id}
                  className="relative rounded-xl border border-red-500/10 bg-card/40 px-3.5 py-2.5 pr-9"
                >
                  <button
                    onClick={() => marcarDekraHecha(v.id)}
                    disabled={marcandoDekraId === v.id}
                    title="Marcar revisión como hecha"
                    className="absolute top-2 right-2 rounded-md p-1 text-muted-foreground hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-300 transition disabled:opacity-50"
                  >
                    {marcandoDekraId === v.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <p className="text-sm font-semibold text-foreground">
                    {v.placa}
                    {(v.marca || v.modelo) && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {[v.marca, v.modelo].filter(Boolean).join(" ")}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {v.clientes?.nombre || "Sin cliente asignado"}
                  </p>
                  <p className="text-xs font-semibold text-accent mt-0.5 capitalize">
                    {v.nombreMes} · vence en {v.diasParaVencer} día
                    {v.diasParaVencer === 1 ? "" : "s"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-foreground/10 bg-card/60 p-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando datos del taller...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Órdenes recientes</h2>
                    <p className="text-sm text-muted-foreground">
                      Últimos trabajos registrados en el sistema
                    </p>
                  </div>

                  <a
                    href="/ordenes"
                    className="rounded-xl bg-foreground/5 px-4 py-2 text-sm text-foreground hover:bg-foreground/10 transition"
                  >
                    Ver todas
                  </a>
                </div>

                {ordenesRecientes.length === 0 ? (
                  <div className="rounded-2xl border border-foreground/10 p-10 text-center text-muted-foreground/70 text-sm">
                    Todavía no hay órdenes registradas.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-foreground/10">
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-card/80 text-muted-foreground">
                        <tr>
                          <th className="text-left p-4">Orden</th>
                          <th className="text-left p-4">Cliente</th>
                          <th className="text-left p-4">Vehículo</th>
                          <th className="text-left p-4">Estado</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ordenesRecientes.map((orden) => (
                          <tr
                            key={orden.id}
                            className="border-t border-foreground/10 hover:bg-card/40 transition"
                          >
                            <td className="p-4 font-semibold text-foreground">
                              #TG-{orden.id}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {orden.vehiculos?.clientes?.nombre || "—"}
                            </td>
                            <td className="p-4 text-muted-foreground">
                              {orden.vehiculos?.placa || "—"}
                            </td>
                            <td className="p-4">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                  estadoBadge[orden.estado] ||
                                  "bg-foreground/5 text-muted-foreground"
                                }`}
                              >
                                {orden.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
                <h2 className="text-xl font-bold text-foreground">Actividad reciente</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Movimientos importantes del sistema
                </p>

                <div className="space-y-5">
                  {actividad.length === 0 ? (
                    <p className="text-sm text-muted-foreground/70">
                      Todavía no hay actividad registrada.
                    </p>
                  ) : (
                    actividad.map((item, i) => (
                      <ActivityItem key={i} {...item} />
                    ))
                  )}
                </div>
              </div>

              <div className="xl:col-span-3 rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 h-56 w-56 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 h-56 w-56 bg-red-500/10 blur-3xl rounded-full" />

                <div className="relative z-10 mb-6">
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Rendimiento semanal
                  </h2>

                  <p className="text-muted-foreground text-sm mt-1">
                    Órdenes ingresadas en los últimos 7 días
                  </p>
                </div>

                <div className="h-[320px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient
                          id="colorOrders"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3b82f6"
                            stopOpacity={0.7}
                          />
                          <stop
                            offset="100%"
                            stopColor="#ef4444"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <XAxis
                        dataKey="day"
                        stroke="currentColor"
                        className="text-muted-foreground/60"
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "16px",
                          color: "white",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#3b82f6"
                        strokeWidth={4}
                        fill="url(#colorOrders)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}

function ActivityItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-2xl bg-foreground/5 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
