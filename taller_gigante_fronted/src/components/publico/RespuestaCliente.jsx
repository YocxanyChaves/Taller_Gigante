import { useState } from "react";
import { ThumbsUp, X } from "lucide-react";
import { responderCotizacion } from "../../services/publico";
import { formatoColones } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Campo from "../ui/Campo";
import Confirmar from "../ui/Confirmar";

// "¿Hacemos el trabajo?": el cliente aprueba o rechaza desde su celular. Siempre
// se confirma antes de mandar. Al terminar devuelve los datos nuevos del trabajo.

export default function RespuestaCliente({ token, total, alResponder }) {
  const [comentario, setComentario] = useState("");
  const [preguntando, setPreguntando] = useState(null); // true = sí, false = no, null = nada
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const responder = async () => {
    setGuardando(true);
    setError("");
    try {
      const datos = await responderCotizacion(token, preguntando, comentario.trim());
      const aprobo = preguntando;
      setPreguntando(null);
      alResponder(datos, aprobo);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <section className="animar-entrada rounded-tarjeta border-2 border-rojo/25 bg-tarjeta p-6 shadow-elevada">
      <h2 className="text-2xl font-bold">¿Hacemos el trabajo?</h2>
      <p className="mt-1 text-lg text-gris">
        El total es <strong className="numeros text-tinta">{formatoColones(total)}</strong>. Revise el detalle arriba y
        díganos.
      </p>

      <Campo
        className="mt-5"
        etiqueta="¿Algo que quiera decirnos?"
        opcional
        multilinea
        maxLength={500}
        placeholder="Por ejemplo: ¿cuándo estaría listo?"
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
      />

      <div className="mt-5 flex flex-col gap-3">
        <Boton icono={ThumbsUp} anchoCompleto className="min-h-16 text-xl" onClick={() => setPreguntando(true)}>
          Sí, hágale
        </Boton>
        <Boton variante="secundario" icono={X} anchoCompleto onClick={() => setPreguntando(false)}>
          No, gracias
        </Boton>
      </div>

      <Confirmar
        abierto={preguntando !== null}
        titulo={preguntando ? "¿Hacemos el trabajo?" : "¿No hacemos el trabajo?"}
        textoConfirmar={preguntando ? "Sí, háganlo" : "Sí, no lo hagan"}
        textoCancelar="Volver"
        peligro={preguntando === false}
        cargando={guardando}
        alConfirmar={responder}
        alCancelar={() => {
          setPreguntando(null);
          setError("");
        }}
      >
        {preguntando
          ? `Le avisamos al taller que sí haga el trabajo por ${formatoColones(total)}.`
          : "Le avisamos al taller que no haga el trabajo. Puede pasar por su carro."}
        {error && <p role="alert" className="mt-3 font-bold text-rojo">{error}</p>}
      </Confirmar>
    </section>
  );
}
