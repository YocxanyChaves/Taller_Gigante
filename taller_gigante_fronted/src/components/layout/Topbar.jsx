import { useEffect, useState } from "react";
import { Menu, Search, UserCircle, LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

export function Topbar({ onMenuClick = () => {} }) {
  const [nombre, setNombre] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata;
      setNombre(meta?.nombre || data.user?.email || "");
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 h-20 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 gap-3 transition-colors duration-300">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-11 w-11 shrink-0 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition"
        >
          <Menu className="h-5 w-5 text-zinc-700 dark:text-white" />
        </button>

        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-4 py-2 w-full max-w-xs">
          <Search className="h-4 w-4 text-zinc-400 dark:text-white/40 shrink-0" />
          <input
            type="text"
            placeholder="Buscar orden, cliente o vehículo..."
            className="bg-transparent outline-none text-sm w-full text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/35"
          />
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
  );
}
