import { Wallet } from "lucide-react";
import Encabezado from "../components/layout/Encabezado";
import Vacio from "../components/ui/Vacio";

export default function Cobros() {
  return (
    <>
      <Encabezado titulo="Cobrar y entregar">
        Haga la cuenta de un trabajo terminado y vea quién debe y cuánto.
      </Encabezado>
      <Vacio icono={Wallet} titulo="En construcción">
        La lista de cobros y los abonos se construyen en la fase 5.
      </Vacio>
    </>
  );
}
