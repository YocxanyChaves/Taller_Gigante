import { Layout } from "../components/layout/Layout";
import { StatCard } from "../components/dashboard/StatCard";
import {
    Car,
    ClipboardList,
    Users,
    DollarSign,
    Activity,
    CheckCircle2,
    Clock,
    } from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from "recharts";

const chartData = [
    { day: "Lun", orders: 4 },
    { day: "Mar", orders: 7 },
    { day: "Mié", orders: 5 },
    { day: "Jue", orders: 9 },
    { day: "Vie", orders: 12 },
    { day: "Sáb", orders: 8 },
];

    const stats = [
    {
        title: "Vehículos activos",
        value: "42",
        change: "+12% esta semana",
        icon: Car,
        color: "blue",
    },

    {
        title: "Órdenes pendientes",
        value: "18",
        change: "+5 nuevas hoy",
        icon: ClipboardList,
        color: "red",
    },

    {
        title: "Clientes registrados",
        value: "126",
        change: "+8 este mes",
        icon: Users,
        color: "blue",
    },

    {
        title: "Ingresos del mes",
        value: "₡2.4M",
        change: "+18% vs mes anterior",
        icon: DollarSign,
        color: "red",
    },
    ];

    const orders = [
    {
        id: "#TG-204",
        client: "Carlos Ramírez",
        vehicle: "Toyota Hilux",
        status: "En proceso",
        date: "Hoy",
    },
    {
        id: "#TG-203",
        client: "María López",
        vehicle: "Honda Civic",
        status: "Pendiente",
        date: "Ayer",
    },
    {
        id: "#TG-202",
        client: "Andrés Mora",
        vehicle: "Nissan Sentra",
        status: "Completado",
        date: "Lunes",
    },
    ];

    export default function Dashboard() {
    return (
        <Layout>
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 shadow-2xl shadow-black/40">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="relative z-10 max-w-3xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
                <Activity className="h-4 w-4 text-red-400" />
                Sistema operativo en tiempo real
                </div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                Panel inteligente del taller
                </h1>

                <p className="mt-4 text-white/55 max-w-2xl">
                Monitoree órdenes de trabajo, vehículos, clientes y rendimiento
                del taller desde un único centro de control.
                </p>
            </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
            ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold">Órdenes recientes</h2>
                    <p className="text-sm text-white/45">
                    Últimos trabajos registrados en el sistema
                    </p>
                </div>

                <button className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15 transition">
                    Ver todas
                </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10">
                <table className="w-full text-sm">
                    <thead className="bg-white/[0.06] text-white/50">
                    <tr>
                        <th className="text-left p-4">Orden</th>
                        <th className="text-left p-4">Cliente</th>
                        <th className="text-left p-4">Vehículo</th>
                        <th className="text-left p-4">Estado</th>
                        <th className="text-left p-4">Fecha</th>
                    </tr>
                    </thead>

                    <tbody>
                    {orders.map((order) => (
                        <tr
                        key={order.id}
                        className="border-t border-white/10 hover:bg-white/[0.04] transition"
                        >
                        <td className="p-4 font-semibold">{order.id}</td>
                        <td className="p-4 text-white/70">{order.client}</td>
                        <td className="p-4 text-white/70">{order.vehicle}</td>
                        <td className="p-4">
                            <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                order.status === "Completado"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : order.status === "En proceso"
                                ? "bg-blue-500/15 text-blue-300"
                                : "bg-red-500/15 text-red-300"
                            }`}
                            >
                            {order.status}
                            </span>
                        </td>
                        <td className="p-4 text-white/50">{order.date}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30">
                <h2 className="text-xl font-bold">Actividad reciente</h2>
                <p className="text-sm text-white/45 mb-6">
                Movimientos importantes del día
                </p>

                <div className="space-y-5">
                <ActivityItem
                    icon={CheckCircle2}
                    title="Orden completada"
                    text="Honda Civic fue marcado como entregado."
                />
                <ActivityItem
                    icon={Clock}
                    title="Nueva orden pendiente"
                    text="Toyota Hilux ingresó a revisión general."
                />
                <ActivityItem
                    icon={Users}
                    title="Cliente registrado"
                    text="Se agregó un nuevo cliente al sistema."
                />
                </div>
            </div>

            <div className="xl:col-span-3 rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-56 w-56 bg-blue-500/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 h-56 w-56 bg-red-500/10 blur-3xl rounded-full" />

            <div className="relative z-10 mb-6">
                <h2 className="text-2xl font-black tracking-tight">
                Rendimiento semanal
                </h2>

                <p className="text-white/45 text-sm mt-1">
                Órdenes procesadas durante la semana
                </p>
            </div>

            <div className="h-[320px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    </defs>

                    <XAxis
                    dataKey="day"
                    stroke="rgba(255,255,255,0.3)"
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
        </div>
        </Layout>
    );
    }

    function ActivityItem({ icon: Icon, title, text }) {
    return (
        <div className="flex gap-4">
        <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-300" />
        </div>

        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-white/45">{text}</p>
        </div>
        </div>
    );
}