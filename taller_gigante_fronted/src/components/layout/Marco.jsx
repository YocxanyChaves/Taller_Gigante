import { NavLink, Outlet } from "react-router-dom";
import { Home, Wrench, Users, Wallet, Plus, LogOut, FlaskConical } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Boton from "../ui/Boton";
import logo from "../../assets/logo-claro.png";

// Marco de todas las pantallas con sesión. Nada escondido: en compu, panel
// lateral flotante con los 4 botones y "Nuevo trabajo"; en celular, los
// mismos botones en una barra fija abajo. Todos con texto.

const SECCIONES = [
  { to: "/inicio", texto: "Inicio", icono: Home },
  { to: "/trabajos", texto: "Trabajos", icono: Wrench },
  { to: "/clientes", texto: "Clientes", icono: Users },
  { to: "/cobros", texto: "Cobros", icono: Wallet },
];

function claseEnlaceLateral({ isActive }) {
  return (
    "relative flex min-h-14 items-center gap-3 rounded-control px-4 text-xl font-bold transition-colors " +
    (isActive
      ? "bg-gradient-to-r from-azul/35 to-azul/5 text-white shadow-[inset_0_0_0_1px_rgb(79_157_255/0.35)] " +
        "before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full before:bg-azul-vivo " +
        "before:shadow-[0_0_12px_rgb(79_157_255)]"
      : "text-texto-2 hover:bg-white/5 hover:text-texto")
  );
}

function claseEnlaceAbajo({ isActive }) {
  return (
    "flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-control text-[0.9rem] leading-tight font-bold tracking-tight transition-colors " +
    (isActive ? "bg-azul/25 text-white shadow-[inset_0_0_0_1px_rgb(79_157_255/0.35)]" : "text-texto-2")
  );
}

export default function Marco() {
  const { nombre, esDemo, cerrarSesion } = useAuth();

  return (
    <div className="min-h-screen md:flex md:gap-6 md:p-4">
      {/* ===== Compu: panel lateral ===== */}
      <aside className="vidrio hidden w-72 shrink-0 flex-col md:sticky md:top-4 md:flex md:h-[calc(100vh-2rem)]">
        <div className="px-6 pt-7 pb-6">
          <img src={logo} alt="Taller Mecánico Gigante" className="w-full" />
        </div>

        <nav aria-label="Secciones" className="flex flex-col gap-1.5 px-3">
          {SECCIONES.map(({ to, texto, icono: Icono }) => (
            <NavLink key={to} to={to} className={claseEnlaceLateral}>
              <Icono aria-hidden="true" size={24} />
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pt-6">
          <Boton to="/trabajos/nuevo" icono={Plus} anchoCompleto>
            Nuevo trabajo
          </Boton>
        </div>

        <div className="mt-auto border-t border-white/[0.06] p-4">
          <p className="flex items-center gap-2 truncate text-base text-texto-2" title={nombre}>
            <span aria-hidden="true" className="luz size-2 shrink-0 bg-emerald-400 text-emerald-400" />
            {nombre}
          </p>
          <Boton variante="gris" icono={LogOut} onClick={cerrarSesion} anchoCompleto className="mt-3">
            Salir
          </Boton>
        </div>
      </aside>

      {/* ===== Celular: barra de arriba ===== */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/[0.06] bg-fondo/70 px-4 py-3 backdrop-blur-xl md:hidden">
        <img src={logo} alt="Taller Mecánico Gigante" className="h-10 w-auto" />
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex min-h-12 items-center gap-2 rounded-control border border-white/10 bg-white/[0.03] px-4 text-base font-bold text-texto-2"
        >
          <LogOut aria-hidden="true" size={20} />
          Salir
        </button>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        {esDemo && (
          <p className="mx-4 mt-4 flex items-center gap-3 rounded-control border border-azul-vivo/30 bg-azul/10 px-4 py-3 text-base text-texto md:mx-0 md:mt-0">
            <FlaskConical aria-hidden="true" size={20} className="shrink-0 text-azul-vivo" />
            Modo demo: estos datos son de prueba. Puede cambiar lo que quiera.
          </p>
        )}
        <main className="flex-1 px-4 py-6 pb-32 md:px-4 md:py-6 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ===== Celular: barra de abajo ===== */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-2 bottom-2 z-40 flex gap-0.5 rounded-panel border border-white/10 bg-panel/80 p-1.5 shadow-[0_-10px_40px_rgb(0_0_0/0.5)] backdrop-blur-xl md:hidden"
      >
        {SECCIONES.map(({ to, texto, icono: Icono }) => (
          <NavLink key={to} to={to} className={claseEnlaceAbajo}>
            <Icono aria-hidden="true" size={24} />
            {texto}
          </NavLink>
        ))}
        <NavLink
          to="/trabajos/nuevo"
          className="flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-control text-[0.9rem] leading-tight tracking-tight bg-gradient-to-b from-rojo-vivo to-rojo font-bold text-white shadow-brillo-rojo"
        >
          <Plus aria-hidden="true" size={24} strokeWidth={3} />
          Nuevo
        </NavLink>
      </nav>
    </div>
  );
}
