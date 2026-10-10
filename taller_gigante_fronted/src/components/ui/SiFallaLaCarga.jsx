import { Component } from "react";
import { RotateCw, WifiOff } from "lucide-react";
import Vacio from "./Vacio";
import Boton from "./Boton";

// Si una página no se pudo bajar (ni con los reintentos de cargarPagina), en
// vez de dejar la pantalla en blanco dice qué pasó y qué hacer.

export default class SiFallaLaCarga extends Component {
  state = { fallo: false };

  static getDerivedStateFromError() {
    return { fallo: true };
  }

  render() {
    if (!this.state.fallo) return this.props.children;
    return (
      <Vacio
        icono={WifiOff}
        titulo="No se pudo abrir esta pantalla"
        accion={
          <Boton icono={RotateCw} onClick={() => window.location.reload()}>
            Intentar de nuevo
          </Boton>
        }
      >
        Revise el internet y toque «Intentar de nuevo».
      </Vacio>
    );
  }
}
