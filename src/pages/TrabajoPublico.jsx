import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarDays, CarFront, MessageCircle, SearchX } from "lucide-react";
import { obtenerTrabajoPublico } from "../services/publico";
import { TALLER } from "../lib/taller";
import { enlaceWhatsApp, mensajeAlTaller } from "../lib/whatsapp";
import { formatoColones, nombreCarro, fechaLarga } from "../lib/formato";
import { mensajeError } from "../lib/errores";
import Placa from "../components/ui/Placa";
import Insignia from "../components/ui/Insignia";
import Boton from "../components/ui/Boton";
import Confeti from "../components/ui/Confeti";
import Vacio from "../components/ui/Vacio";
import ProgresoCliente from "../components/publico/ProgresoCliente";
import RespuestaCliente from "../components/publico/RespuestaCliente";
import logo from "../assets/logo-oscuro.png";

// Página del cliente: la abre desde el link que le manda el taller, sin
// cuenta. Ve cómo va su carro, el precio y, si toca, responde si se hace el
// trabajo. Pensada para celular. Solo muestra lo que devuelve
// get_trabajo_publico() (nunca teléfonos, direcciones ni costos del taller).

// La frase grande de arriba según el estado.
function titular(t) {
  switch (t.estado) {
    case "cita":
      return t.fecha_cita ? `Su cita es el ${fechaLarga(t.fecha_cita)}` : "Tiene una cita en el taller";
    case "en_revision":
      return "Estamos revisando su carro";
    case "esperando_aprobacion":
      return "Ya revisamos su carro";
    case "esperando_repuestos":
      return "Estamos esperando los repuestos";
    case "en_reparacion":
      return "Estamos arreglando su carro";
    case "listo":
      return "¡Su carro está listo para recoger!";
    case "entregado":
      return "¡Gracias por confiar en nosotros!";
    case "no_aprobado":
      return "Entendido, no haremos el trabajo";
    case "cancelado":
      return "Este trabajo se canceló";
    default:
      return "Así va su carro";
  }
}

const SUBTITULO = {
  esperando_aprobacion: "Abajo está lo que tiene y cuánto cuesta. Díganos si lo hacemos.",
  no_aprobado: "Puede pasar por su carro cuando guste.",
  listo: "Puede pasar por él cuando guste.",
};

export default function TrabajoPublico() {
  const { token } = useParams();
  const [trabajo, setTrabajo] = useState(undefined); // undefined = cargando, null = no existe
  const [error, setError] = useState("");
  const [celebrando, setCelebrando] = useState(false);
  const [recienRespondio, setRecienRespondio] = useState(null); // true = aprobó, false = no

  const cargar = useCallback(
    () =>
      obtenerTrabajoPublico(token)
        .then((datos) => {
          setTrabajo(datos);
          setError("");
          // Si el carro ya está listo, se celebra al abrir.
          if (datos?.estado === "listo") setCelebrando(true);
        })
        .catch((e) => setError(mensajeError(e))),
    [token]
  );

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alResponder = (datos, aprobo) => {
    setTrabajo(datos);
    setRecienRespondio(aprobo);
    if (aprobo) setCelebrando(true);
  };

  const placa = trabajo?.carro?.placa;
  const botonTaller = (
    <Boton
      variante="whatsapp"
      icono={MessageCircle}
      anchoCompleto
      href={enlaceWhatsApp(TALLER.whatsapp, mensajeAlTaller({ placa }))}
    >
      Escribirle al taller
    </Boton>
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-linea bg-tarjeta">
        <div className="mx-auto flex max-w-xl justify-center px-4 py-4">
          <img src={logo} alt={TALLER.nombre} className="h-12 w-auto" />
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-8">
        {error && (
          <Vacio icono={SearchX} titulo="No se pudo abrir" accion={botonTaller}>
            Revise su internet e intente de nuevo. Si sigue igual, escríbanos.
          </Vacio>
        )}

        {!error && trabajo === undefined && (
          <p className="animate-pulse py-10 text-center text-xl text-gris">Buscando su carro…</p>
        )}

        {!error && trabajo === null && (
          <Vacio icono={SearchX} titulo="No encontramos este link" accion={botonTaller}>
            Puede que el taller le haya mandado uno nuevo. Escríbanos y se lo reenviamos.
          </Vacio>
        )}

        {trabajo && (
          <>
            <section className="animar-entrada relative">
              {celebrando && <Confeti />}
              <p className="text-xl text-gris">Hola{trabajo.cliente ? ` ${trabajo.cliente}` : ""},</p>
              <h1 className="mt-1 text-3xl font-bold sm:text-4xl">{titular(trabajo)}</h1>
              {SUBTITULO[trabajo.estado] && <p className="mt-2 text-lg text-gris">{SUBTITULO[trabajo.estado]}</p>}
            </section>

            {recienRespondio !== null && (
              <p role="status" className="aparecer rounded-tarjeta border-2 border-verde/40 bg-verde/10 p-4 text-lg font-bold text-verde-texto">
                {recienRespondio
                  ? "¡Gracias! Ya le avisamos al taller. Le escribimos cuando su carro esté listo."
                  : "Gracias por avisarnos. Puede pasar por su carro cuando guste."}
              </p>
            )}

            <section
              className="animar-entrada flex flex-col gap-4 rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta"
              style={{ "--retraso": "80ms" }}
            >
              <div className="flex items-center gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-suave">
                  <CarFront aria-hidden="true" size={26} />
                </span>
                <div className="min-w-0">
                  <p className="text-xl font-bold">{nombreCarro(trabajo.carro)}</p>
                  {placa && (
                    <div className="mt-1">
                      <Placa>{placa.toUpperCase()}</Placa>
                    </div>
                  )}
                </div>
              </div>
              <Insignia estado={trabajo.estado} grande />
              {trabajo.estado === "cita" && trabajo.fecha_cita && (
                <p className="flex items-center gap-2 text-lg">
                  <CalendarDays aria-hidden="true" size={22} className="text-gris" />
                  {fechaLarga(trabajo.fecha_cita)}
                </p>
              )}
            </section>

            {!["cita", "cancelado", "no_aprobado"].includes(trabajo.estado) && (
              <section
                className="animar-entrada rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta"
                style={{ "--retraso": "160ms" }}
              >
                <h2 className="mb-5 text-xl font-bold">Cómo va</h2>
                <ProgresoCliente trabajo={trabajo} />
              </section>
            )}

            <Detalle trabajo={trabajo} />

            {trabajo.puede_responder && (
              <RespuestaCliente token={token} total={trabajo.total} alResponder={alResponder} />
            )}

            <section className="flex flex-col gap-3 pt-2">
              <p className="text-center text-lg text-gris">¿Tiene alguna pregunta?</p>
              {botonTaller}
            </section>
          </>
        )}

        <p className="pt-4 text-center text-base text-gris">{TALLER.nombre}</p>
      </main>
    </div>
  );
}

// Qué tiene el carro y cuánto cuesta (sin los costos del taller).
function Detalle({ trabajo }) {
  const items = trabajo.items ?? [];
  if (!trabajo.diagnostico && items.length === 0) return null;
  const hayPagos = Number(trabajo.pagado) > 0;

  return (
    <section
      className="animar-entrada rounded-tarjeta border border-linea bg-tarjeta p-6 shadow-tarjeta"
      style={{ "--retraso": "240ms" }}
    >
      <h2 className="text-xl font-bold">Lo que tiene y cuánto cuesta</h2>
      {trabajo.diagnostico && <p className="mt-3 text-lg whitespace-pre-line">{trabajo.diagnostico}</p>}

      {items.length > 0 && (
        <ul className="mt-4 divide-y divide-linea border-y border-linea">
          {items.map((item, i) => (
            <li key={i} className="flex items-start justify-between gap-4 py-3">
              <p className="min-w-0 text-lg break-words">
                {item.descripcion}
                {Number(item.cantidad) !== 1 && <span className="text-gris"> × {Number(item.cantidad)}</span>}
              </p>
              <p className="numeros shrink-0 text-lg font-bold">{formatoColones(item.subtotal)}</p>
            </li>
          ))}
        </ul>
      )}

      {trabajo.aprobada === false && trabajo.cobro_revision > 0 && (
        <p className="mt-3 text-base text-gris">Como no se hizo el trabajo, solo se cobra la revisión.</p>
      )}

      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-xl font-bold">Total</p>
        <p className="numeros text-3xl font-bold">{formatoColones(trabajo.total)}</p>
      </div>
      {hayPagos && (
        <>
          <div className="mt-2 flex items-baseline justify-between text-lg text-gris">
            <p>Ya pagó</p>
            <p className="numeros">{formatoColones(trabajo.pagado)}</p>
          </div>
          {Number(trabajo.saldo) > 0 ? (
            <div className="mt-1 flex items-baseline justify-between">
              <p className="text-lg font-bold">Falta</p>
              <p className="numeros text-2xl font-bold text-rojo">{formatoColones(trabajo.saldo)}</p>
            </div>
          ) : (
            <p className="mt-2 text-right text-lg font-bold text-verde-texto">Pagado completo ✓</p>
          )}
        </>
      )}
    </section>
  );
}
