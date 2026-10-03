import { Home, SearchX } from "lucide-react";
import Boton from "../components/ui/Boton";
import Vacio from "../components/ui/Vacio";

export default function NoEncontrada() {
  return (
    <Vacio
      icono={SearchX}
      titulo="Esta página no existe"
      accion={
        <Boton variante="secundario" icono={Home} to="/inicio">
          Ir a Inicio
        </Boton>
      }
    >
      Puede que el enlace esté mal escrito.
    </Vacio>
  );
}
