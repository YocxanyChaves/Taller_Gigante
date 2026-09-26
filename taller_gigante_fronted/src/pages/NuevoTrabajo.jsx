import { ClipboardPlus } from "lucide-react";
import Encabezado from "../components/layout/Encabezado";
import Vacio from "../components/ui/Vacio";

export default function NuevoTrabajo() {
  return (
    <>
      <Encabezado titulo="Nuevo trabajo">
        Anote un carro nuevo: el teléfono del cliente, la placa y qué le pasa.
      </Encabezado>
      <Vacio icono={ClipboardPlus} titulo="En construcción">
        El asistente paso a paso para anotar un trabajo se construye en la fase 3.
      </Vacio>
    </>
  );
}
