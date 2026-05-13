import { Bell, Search, UserCircle } from "lucide-react";

export function Topbar() {
    return (
        <header className="sticky top-0 z-20 h-20 border-b border-white/10 bg-black/30 backdrop-blur-xl flex items-center justify-between px-8">
        <div>
            <p className="text-sm text-white/50">Panel de control</p>
            <h2 className="text-xl font-bold">Bienvenida, Yocxany</h2>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 w-72">
            <Search className="h-4 w-4 text-white/40" />
            <input
                type="text"
                placeholder="Buscar orden, cliente o vehículo..."
                className="bg-transparent outline-none text-sm w-full placeholder:text-white/35"
            />
            </div>

            <button className="h-11 w-11 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center hover:bg-white/10 transition">
            <Bell className="h-5 w-5" />
            </button>

            <button className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 hover:bg-white/10 transition">
            <UserCircle className="h-6 w-6" />
            <span className="hidden md:block text-sm">Admin</span>
            </button>
        </div>
        </header>
    );
}