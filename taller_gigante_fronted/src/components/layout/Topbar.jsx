import { useEffect, useState } from "react";
import { Menu, Search, UserCircle, LogOut, Sun, Moon, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

export function Topbar({ onMenuClick = () => {} }) {
  const [nombre, setNombre] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-20 h-20 border-b border-foreground/10 bg-card/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-8 gap-3 transition-colors duration-300">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden h-11 w-11 shrink-0 rounded-2xl border border-foreground/10 bg-card/60 flex items-center justify-center hover:bg-foreground/5 transition"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>

        <div className="hidden md:flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 px-4 py-2 w-full max-w-xs">
          <Search className="h-4 w-4 text-muted-foreground/70 shrink-0" />
          <input
            type="text"
            placeholder="Buscar orden, cliente o vehículo..."
            className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
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
  );
}
