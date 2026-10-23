import { useState } from "react";
import { actualizarCarro } from "../../services/trabajos";
import { mensajeError } from "../../lib/errores";
import Dialogo from "../ui/Dialogo";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";
import CampoMotor from "./CampoMotor";
import { ElegirUnidad } from "../trabajos/CamposLlegada";

// "Cambiar datos del carro": marca, modelo, año, motor y si el tablero marca
// kilómetros o millas. La placa no se cambia aquí. Se monta de nuevo cada vez
// que se abre, así arranca con los datos actuales.

function anioValido(anio) {
  if (anio === "") return true;
  const n = Number(anio);
  return /^\d{4}$/.test(anio) && n >= 1950 && n <= new Date().getFullYear() + 1;
}

export default function DialogoCarro({ vehiculo, alCerrar, alGuardado }) {
  const [datos, setDatos] = useState({
    marca: vehiculo.marca ?? "",
    modelo: vehiculo.modelo ?? "",
    anio: vehiculo.anio ? String(vehiculo.anio) : "",
    tipoMotor: vehiculo.tipo_motor ?? "",
    unidad: vehiculo.unidad_distancia ?? "km",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiar = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }));
  const errorAnio = anioValido(datos.anio) ? undefined : "Escriba el año con 4 números, por ejemplo 2012.";

  const guardar = async () => {
    if (errorAnio) return;
    setGuardando(true);
    setError("");
    try {
      await actualizarCarro(vehiculo.id, datos);
      await alGuardado();
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      abierto
      titulo="Cambiar datos del carro"
      alCerrar={alCerrar}
      alEnviar={guardar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar cambios"}
          </Boton>
        </>
      }
    >
      <div className="flex flex-col gap-5 text-tinta">
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Marca" opcional autoFocus value={datos.marca} onChange={(e) => cambiar("marca")(e.target.value)} />
          <Campo etiqueta="Modelo" opcional value={datos.modelo} onChange={(e) => cambiar("modelo")(e.target.value)} />
          <Campo
            etiqueta="Año"
            opcional
            inputMode="numeric"
            maxLength={4}
            value={datos.anio}
            onChange={(e) => cambiar("anio")(e.target.value)}
            error={errorAnio}
          />
        </div>
        <CampoMotor valor={datos.tipoMotor} alCambiar={cambiar("tipoMotor")} />
        <ElegirUnidad valor={datos.unidad} alCambiar={cambiar("unidad")} />
        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
