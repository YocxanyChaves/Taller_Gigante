import { useState } from "react";
import { HandCoins } from "lucide-react";
import { registrarAbono } from "../../services/cobros";
import { formatoColones, montoDe } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Dialogo from "../ui/Dialogo";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";
import { CampoMonto, ElegirMetodo } from "./CamposPago";

// "Registrar abono": cuánto pagó (sugiere todo el saldo) y cómo.
// `carro` es el texto que dice de qué trabajo es ("Toyota Hilux BTR-482").
// Se monta de nuevo cada vez que se abre.

export default function DialogoAbono({ ordenId, saldo, carro, alCerrar, alGuardado }) {
  const [valor, setValor] = useState(String(Math.round(saldo)));
  const [metodo, setMetodo] = useState(null);
  const [nota, setNota] = useState("");
  const [intento, setIntento] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const monto = montoDe(valor);
  const errores = {
    monto:
      monto <= 0
        ? "Escriba cuánto pagó."
        : monto > saldo
          ? `No puede ser más de lo que debe (${formatoColones(saldo)}).`
          : undefined,
    metodo: !metodo ? "Escoja cómo pagó." : undefined,
  };

  const guardar = async () => {
    setIntento(true);
    if (errores.monto || errores.metodo) return;
    setGuardando(true);
    setError("");
    try {
      const queda = await registrarAbono(ordenId, { monto, metodo, nota: nota.trim() || null });
      await alGuardado(queda);
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  };

  return (
    <Dialogo
      abierto
      titulo="Registrar abono"
      alCerrar={alCerrar}
      alEnviar={guardar}
      pie={
        <>
          <Boton variante="gris" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" icono={HandCoins} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar abono"}
          </Boton>
        </>
      }
    >
      <p>
        {carro && (
          <>
            <strong className="text-tinta">{carro}</strong> ·{" "}
          </>
        )}
        Debe <strong className="numeros text-tinta">{formatoColones(saldo)}</strong>.
      </p>
      <div className="mt-5 flex flex-col gap-5 text-tinta">
        <CampoMonto
          etiqueta="¿Cuánto pagó?"
          autoFocus
          valor={valor}
          alCambiar={setValor}
          ayuda={monto > 0 && monto < saldo ? `Queda debiendo ${formatoColones(saldo - monto)}` : undefined}
          error={intento ? errores.monto : undefined}
        />
        <div>
          <ElegirMetodo valor={metodo} alCambiar={setMetodo} />
          {intento && errores.metodo && <p role="alert" className="mt-2 font-bold text-rojo">{errores.metodo}</p>}
        </div>
        <Campo
          etiqueta="Nota"
          opcional
          placeholder="Por ejemplo: número de comprobante del SINPE"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
        />
        {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      </div>
    </Dialogo>
  );
}
