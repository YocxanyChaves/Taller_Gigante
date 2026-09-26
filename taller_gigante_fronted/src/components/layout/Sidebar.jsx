import { Link, useLocation } from "react-router-dom";
import { Logo } from "../Logo";
import { useAuth } from "../../context/AuthContext";
import {
    LayoutDashboard,
    Users,
    Car,
    ClipboardList,
    History,
    Settings,
    UserCog,
    X,
    } from "lucide-react";

    const baseMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Clientes", icon: Users, path: "/clientes" },
    { name: "Vehículos", icon: Car, path: "/vehiculos" },
    { name: "Órdenes", icon: ClipboardList, path: "/ordenes" },
    { name: "Historial", icon: History, path: "/historial" },
    { name: "Configuración", icon: Settings, path: "/configuracion" },
    ];

    export function Sidebar({ open = false, onClose = () => {} }) {
    const location = useLocation();
    const { esAdmin } = useAuth();

    const menuItems =
        esAdmin
        ? [
            ...baseMenuItems,
            { name: "Usuarios", icon: UserCog, path: "/usuarios" },
            ]
        : baseMenuItems;

    return (
        <>
        {open && (
            <div
            onClick={onClose}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            />
        )}

        <aside
            className={`fixed left-0 top-0 z-40 h-screen w-72 border-r border-foreground/10 bg-card backdrop-blur-xl p-6 transition-all duration-300 lg:bg-card/70 ${
            open ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
            <div className="relative flex items-center justify-center mb-10">
            <Link to="/dashboard" onClick={onClose} className="flex items-center group">
                <div className="flex items-center group-hover:scale-105 transition-transform">
                <Logo className="h-[120px] w-auto" />
                </div>
            </Link>

            <button
                onClick={onClose}
                className="lg:hidden absolute right-0 h-9 w-9 flex items-center justify-center rounded-xl border border-foreground/10 text-muted-foreground"
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
                        ? "bg-foreground/5 text-foreground shadow-lg shadow-blue-500/10 border border-foreground/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    }`}
                >
                    <Icon className="h-5 w-5" />
                    {item.name}
                </Link>
                );
            })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 rounded-3xl border border-foreground/10 bg-card/60 p-4">
            <p className="text-sm font-semibold text-foreground">Estado del taller</p>
            <p className="text-xs text-muted-foreground mt-1">Operación activa</p>

            <div className="mt-4 h-2 rounded-full bg-foreground/10 overflow-hidden">
                <div className="h-full w-[78%] bg-gradient-to-r from-red-500 to-blue-500" />
            </div>
            </div>
        </aside>
        </>
    );
}
