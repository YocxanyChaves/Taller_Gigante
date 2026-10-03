import { Users } from "lucide-react";
import Encabezado from "../components/layout/Encabezado";
import Vacio from "../components/ui/Vacio";

export default function Clientes() {
  return (
    <>
      <Encabezado titulo="Buscar un cliente">
        Busque a un cliente por nombre, teléfono o placa para ver sus carros y lo que debe.
      </Encabezado>
      <Vacio icono={Users} titulo="En construcción">
        El buscador y la ficha del cliente se construyen en la fase 6.
      </Vacio>
    </>
  );
}
