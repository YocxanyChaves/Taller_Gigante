import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    History,
    Settings,
    Wrench,
    } from "lucide-react";

    const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true },
    { name: "Clientes", icon: Users },
    { name: "Vehículos", icon: Car },
    { name: "Órdenes", icon: ClipboardList },
    { name: "Historial", icon: History },
    { name: "Configuración", icon: Settings },
    ];

    export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-screen w-72 border-r border-white/10 bg-black/40 backdrop-blur-xl p-6">
        <div className="flex items-center gap-3 mb-10">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Wrench className="h-6 w-6" />
            </div>

            <div>
            <h1 className="text-lg font-bold tracking-wide">Taller Gigante</h1>
            <p className="text-xs text-white/50">Sistema administrativo</p>
            </div>
        </div>

        <nav className="space-y-2">
            {menuItems.map((item) => {
            const Icon = item.icon;

            return (
                <button
                key={item.name}
                className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${
                    item.active
                    ? "bg-white/10 text-white shadow-lg shadow-blue-500/10 border border-white/10"
                    : "text-white/55 hover:text-white hover:bg-white/5"
                }`}
                >
                <Icon className="h-5 w-5" />
                {item.name}
                </button>
            );
            })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold">Estado del taller</p>
            <p className="text-xs text-white/50 mt-1">Operación activa</p>

            <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-[78%] bg-gradient-to-r from-red-500 to-blue-500" />
            </div>
        </div>
        </aside>
    );
}