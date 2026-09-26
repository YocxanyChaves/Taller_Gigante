import { NavLink, Outlet } from "react-router-dom";
import { Home, Wrench, Users, Wallet, Plus, LogOut, FlaskConical } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Boton from "../ui/Boton";
import logo from "../../assets/logo-claro.png";

// Marco de todas las pantallas con sesión. Nada escondido: en compu, barra
// lateral con los 4 botones y "Nuevo trabajo"; en celular, los mismos
// botones en una barra fija abajo. Todos con texto.

const SECCIONES = [
  { to: "/inicio", texto: "Inicio", icono: Home },
  { to: "/trabajos", texto: "Trabajos", icono: Wrench },
  { to: "/clientes", texto: "Clientes", icono: Users },
  { to: "/cobros", texto: "Cobros", icono: Wallet },
];

function claseEnlaceLateral({ isActive }) {
  return (
    "flex min-h-14 items-center gap-3 border-l-4 px-4 text-xl font-bold transition-colors " +
    (isActive
      ? "border-azul-vivo bg-azul/15 text-white"
      : "border-transparent text-texto-2 hover:bg-white/5 hover:text-texto")
  );
}

function claseEnlaceAbajo({ isActive }) {
  return (
    "flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 border-t-4 text-base font-bold " +
    (isActive ? "border-azul-vivo bg-azul/15 text-white" : "border-transparent text-texto-2")
  );
}

export default function Marco() {
  const { nombre, esDemo, cerrarSesion } = useAuth();

  return (
    <div className="min-h-screen md:flex">
      {/* ===== Compu: barra lateral ===== */}
      <aside className="hidden w-72 shrink-0 flex-col border-r border-linea bg-panel/80 backdrop-blur md:flex md:h-screen md:sticky md:top-0">
        <div className="p-5">
          <img src={logo} alt="Taller Mecánico Gigante" className="w-full" />
        </div>

        <nav aria-label="Secciones" className="flex flex-col gap-2 px-4">
          {SECCIONES.map(({ to, texto, icono: Icono }) => (
            <NavLink key={to} to={to} className={claseEnlaceLateral}>
              <Icono aria-hidden="true" size={24} />
              {texto}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 pt-6">
          <Boton to="/trabajos/nuevo" icono={Plus} anchoCompleto>
            Nuevo trabajo
          </Boton>
        </div>

        <div className="mt-auto border-t border-linea p-4">
          <p className="truncate text-base text-texto-2" title={nombre}>
            {nombre}
          </p>
          <Boton variante="gris" icono={LogOut} onClick={cerrarSesion} anchoCompleto className="mt-3">
            Salir
          </Boton>
        </div>
      </aside>

      {/* ===== Celular: barra de arriba ===== */}
      <header className="flex items-center justify-between gap-3 border-b border-linea bg-panel px-4 py-2 md:hidden">
        <img src={logo} alt="Taller Mecánico Gigante" className="h-12 w-auto" />
        <button
          type="button"
          onClick={cerrarSesion}
          className="flex min-h-12 items-center gap-2 border border-linea px-3 text-base font-bold text-texto-2"
        >
          <LogOut aria-hidden="true" size={20} />
          Salir
        </button>
      </header>

      <div className="flex min-w-0 flex-1 flex-col">
        {esDemo && (
          <p className="flex items-center gap-2 border-b border-azul-vivo/40 bg-azul/15 px-4 py-2 text-base text-texto md:px-8">
            <FlaskConical aria-hidden="true" size={20} className="shrink-0" />
            Modo demo: estos datos son de prueba. Puede cambiar lo que quiera.
          </p>
        )}
        <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:py-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ===== Celular: barra de abajo ===== */}
      <nav
        aria-label="Secciones"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-linea bg-panel md:hidden"
      >
        {SECCIONES.map(({ to, texto, icono: Icono }) => (
          <NavLink key={to} to={to} className={claseEnlaceAbajo}>
            <Icono aria-hidden="true" size={24} />
            {texto}
          </NavLink>
        ))}
        <NavLink
          to="/trabajos/nuevo"
          className="flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 bg-rojo text-base font-bold text-white"
        >
          <Plus aria-hidden="true" size={24} strokeWidth={3} />
          Nuevo
        </NavLink>
      </nav>
    </div>
  );
}
