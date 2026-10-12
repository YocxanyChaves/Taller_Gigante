import { Link, Outlet, useLocation } from "react-router-dom";
import { ArrowLeft, House, Plus, LogOut, FlaskConical } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Boton from "../ui/Boton";
import logo from "../../assets/logo-oscuro.png";

// Marco de todas las pantallas con sesión. Inicio es el menú ("¿Qué desea
// hacer?"); las demás pantallas tienen arriba "← Inicio" para volver y el
// botón rojo "Agregar un carro al sistema" siempre a mano. Nada escondido.

export default function Marco() {
  const { esDemo, cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const enInicio = pathname === "/inicio";
  const recibiendo = pathname === "/trabajos/nuevo";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-linea bg-tarjeta/90 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
          {enInicio ? (
            <img src={logo} alt="Taller Mecánico Gigante" className="h-10 w-auto sm:h-11" />
          ) : (
            <Link
              to="/inicio"
              className="group flex min-h-12 items-center gap-2 rounded-control pr-3 text-lg font-bold transition-colors hover:text-rojo"
            >
              <ArrowLeft
                aria-hidden="true"
                size={24}
                strokeWidth={2.4}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Inicio
            </Link>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {!enInicio && !recibiendo && (
              <Boton to="/trabajos/nuevo" icono={Plus} className="min-h-12 px-4 sm:px-6">
                <span className="sm:hidden">Agregar carro</span>
                <span className="hidden sm:inline">Agregar un carro al sistema</span>
              </Boton>
            )}
            {/* Salir solo en Inicio: en celular no caben tres botones arriba. */}
            {enInicio && (
              <Boton variante="gris" icono={LogOut} onClick={cerrarSesion} className="min-h-12 px-3 sm:px-4">
                Salir
              </Boton>
            )}
          </div>
        </div>
      </header>

      {esDemo && (
        <p className="border-b border-amarillo/40 bg-amarillo/15 px-4 py-2.5 text-center text-base">
          <FlaskConical aria-hidden="true" size={18} className="mr-2 inline align-[-3px]" />
          <strong>Modo demo:</strong> estos datos son de prueba. Puede cambiar lo que quiera.
        </p>
      )}

      <main key={pathname} className="animar-entrada mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8 sm:py-12">
        <Outlet />

        {/* Al terminar de ver una pantalla, volver al menú sin subir hasta
            arriba. No va en el asistente de agregar un carro: ahí los botones
            de abajo son para avanzar y uno se saldría a medio llenar. */}
        {!enInicio && !recibiendo && (
          <Boton icono={House} to="/inicio" anchoCompleto className="mt-12 min-h-16 text-xl">
            Volver al inicio
          </Boton>
        )}
      </main>
    </div>
  );
}
