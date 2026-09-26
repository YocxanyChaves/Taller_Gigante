import { Wrench } from "lucide-react";
import Encabezado from "../components/layout/Encabezado";
import Vacio from "../components/ui/Vacio";

export default function Trabajos() {
  return (
    <>
      <Encabezado titulo="Trabajos">
        Todos los carros que están en el taller, ordenados por etapa.
      </Encabezado>
      <Vacio icono={Wrench} titulo="En construcción">
        El tablero de trabajos y el botón de siguiente paso se construyen en la fase 3.
      </Vacio>
    </>
  );
}
