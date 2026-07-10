import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    History,
    Settings,
    X,
    } from "lucide-react";

    const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Clientes", icon: Users, path: "/clientes" },
    { name: "Vehículos", icon: Car, path: "/vehiculos" },
    { name: "Órdenes", icon: ClipboardList, path: "/ordenes" },
    { name: "Historial", icon: History, path: "/historial" },
    { name: "Configuración", icon: Settings, path: "/configuracion" },
    ];

    export function Sidebar({ open = false, onClose = () => {} }) {
    const location = useLocation();

    return (
        <>
        {open && (
            <div
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            />
        )}

        <aside
            className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-black/10 dark:border-white/10 bg-white dark:bg-black/40 backdrop-blur-xl p-6 transition-all duration-300 lg:bg-white/70 lg:dark:bg-black/40 ${
            open ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            <div className="flex items-center justify-between mb-10">
            <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3 group">
                <div className="flex items-center group-hover:scale-105 transition-transform">
                <Logo className="h-[70px] w-auto" />
                </div>

                <div>
                <h1 className="text-lg font-bold tracking-wide text-zinc-900 dark:text-white">Taller Gigante</h1>
                <p className="text-xs text-zinc-500 dark:text-white/50">Sistema administrativo</p>
                </div>
            </Link>

            <button
                onClick={onClose}
                className="lg:hidden h-9 w-9 flex items-center justify-center rounded-xl border border-black/10 dark:border-white/10 text-zinc-500 dark:text-white/60"
            >
                <X className="h-4 w-4" />
            </button>
            </div>

            <nav className="space-y-2">
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.path);

                return (
                <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all ${
                    active
                        ? "bg-black/5 dark:bg-white/10 text-zinc-900 dark:text-white shadow-lg shadow-blue-500/10 border border-black/10 dark:border-white/10"
                        : "text-zinc-500 dark:text-white/55 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                >
                    <Icon className="h-5 w-5" />
                    {item.name}
                </Link>
                );
            })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white">Estado del taller</p>
            <p className="text-xs text-zinc-500 dark:text-white/50 mt-1">Operación activa</p>

            <div className="mt-4 h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-red-500 to-blue-500" />
            </div>
            </div>
        </aside>
        </>
    );
}
