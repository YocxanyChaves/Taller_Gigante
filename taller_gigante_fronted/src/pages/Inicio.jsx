import { LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Encabezado from "../components/layout/Encabezado";
import Vacio from "../components/ui/Vacio";

export default function Inicio() {
  const { nombre } = useAuth();
  const primerNombre = nombre.split(" ")[0];

  return (
    <>
      <Encabezado titulo={`Hola, ${primerNombre}`}>
        Aquí va a ver cuántos carros hay en el taller, quién debe y cuánta plata ha entrado.
      </Encabezado>
      <Vacio icono={LayoutDashboard} titulo="En construcción">
        Las tarjetas y el gráfico de plata se construyen en la fase 5.
      </Vacio>
    </>
  );
}
