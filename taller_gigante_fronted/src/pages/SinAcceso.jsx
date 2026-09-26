import { LogOut, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Boton from "../components/ui/Boton";
import Vacio from "../components/ui/Vacio";

// Cuenta con rol 'pendiente': existe, pero un admin todavía no le dio acceso.

export default function SinAcceso() {
  const { cerrarSesion } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <Vacio
          icono={Lock}
          titulo="Su cuenta todavía no tiene acceso"
          accion={
            <Boton variante="secundario" icono={LogOut} onClick={cerrarSesion}>
              Salir
            </Boton>
          }
        >
          Pídale a la persona que administra el sistema que le dé permiso. Después vuelva a entrar.
        </Vacio>
      </div>
    </main>
  );
}
