import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Car, CarFront, CheckCircle2, Clock, History, ListChecks, Sun, Sunrise, UserPlus, User } from "lucide-react";
import { buscarVehiculoPorPlaca, buscarClientesPorTelefono, recibirCarro, anotarVisitaPasada } from "../services/trabajos";
import { obtenerClienteBasico } from "../services/clientes";
import { textoMetodo } from "../services/cobros";
import useBusqueda from "../lib/useBusqueda";
import { LLEGADA_VACIA, TEXTO_GASOLINA, datosLlegada, kmLlegada, llegadaLista } from "../lib/llegada";
import { mensajeError } from "../lib/errores";
import {
  normalizarPlaca,
  soloDigitos,
  formatoTelefono,
  formatoDistancia,
  formatoColones,
  montoDe,
  nombreCarro,
  fechaLarga,
  fechaInputAISO,
  isoAFechaInput,
} from "../lib/formato";
import Asistente from "../components/ui/Asistente";
import Campo from "../components/ui/Campo";
import Aviso from "../components/ui/Aviso";
import Eleccion from "../components/ui/Eleccion";
import Resumen from "../components/recibir/Resumen";
import CarroRecibido from "../components/recibir/CarroRecibido";
import ElegirCarro from "../components/recibir/ElegirCarro";
import CamposLlegada from "../components/trabajos/CamposLlegada";
import CampoMotor from "../components/clientes/CampoMotor";
import { CampoMonto, ElegirMetodo } from "../components/cobros/CamposPago";

// "Agregar un carro al sistema": una pregunta por pantalla. Primero pregunta si
// el carro ya está registrado: si sí, se escoge de la lista por el nombre del
// dueño (el tío conoce los carros por la persona); si no, se anota la placa.
// Si el carro ya vino, se saltan el teléfono y los datos del carro. Si ya
// está aquí, se pregunta cómo llegó (en una cita se pregunta cuando llega). Los pasos
// se arman solos según lo que se va encontrando.
// «Ya vino y se fue» es para anotar una visita que ya pasó, solo para el
// historial: se pregunta qué día vino, qué se le hizo, qué marcaba el tablero
// y cuánto se cobró, y el trabajo queda entregado de una vez.
// Desde la ficha del cliente llega con ?placa= (ese carro) o ?cliente= (un
// carro de ese cliente): entonces no se pregunta nada de eso. Con
// ?visita=pasada ya viene escogido «Ya vino y se fue».

const VACIO = {
  tipo: null, // "registrado" | "nuevo" | null
  carroElegido: null, // el carro escogido de la lista (si "registrado")
  placa: "",
  telefono: "",
  eleccionCliente: null, // un cliente encontrado, "nuevo" o null
  nombre: "",
  marca: "",
  modelo: "",
  anio: "",
  tipoMotor: "",
  problema: "",
  cuando: null, // "ya" | "hoy" | "manana" | "fecha" | "pasada"
  fecha: "", // día de la cita o, si "pasada", el día en que vino
  // Lo que marca el tablero, gasolina y notas, si ya está aquí (o solo el
  // tablero si ya vino y se fue). unidad null = la que ya tenga el carro.
  llegada: { ...LLEGADA_VACIA, unidad: null },
  // Si ya vino y se fue: cuánto se cobró y si ya pagó.
  monto: "",
  pagado: null, // "si" | "no" | null
  metodo: null,
  proximoPago: "",
};

const CUANDO = [
  { valor: "ya", titulo: "Ya está aquí", ayuda: "Lo reviso ahora", icono: Car },
  { valor: "hoy", titulo: "Hoy", ayuda: "Viene más tarde", icono: Sun },
  { valor: "manana", titulo: "Mañana", icono: Sunrise },
  { valor: "fecha", titulo: "Escoger otro día", icono: CalendarDays },
  { valor: "pasada", titulo: "Ya vino y se fue", ayuda: "Solo para anotarlo en el historial", icono: History },
];

// El día en que vino (visita pasada), a mediodía para que no cambie de día
// por la zona horaria. null si no hay fecha.
function fechaVisita(fecha) {
  const [anio, mes, d] = (fecha ?? "").split("-").map(Number);
  if (!anio || !mes || !d) return null;
  return new Date(anio, mes - 1, d, 12).toISOString();
}

// La cita se guarda a las 8 a. m. del día escogido (el taller no maneja horas).
// null si todavía no hay día (escogió "otro día" pero no ha puesto la fecha).
function fechaCita(cuando, fecha) {
  const dia = new Date();
  if (cuando === "manana") dia.setDate(dia.getDate() + 1);
  if (cuando === "fecha") {
    const [anio, mes, d] = (fecha ?? "").split("-").map(Number);
    if (!anio || !mes || !d) return null;
    dia.setFullYear(anio, mes - 1, d);
  }
  dia.setHours(8, 0, 0, 0);
  return Number.isNaN(dia.getTime()) ? null : dia.toISOString();
}

function anioValido(anio) {
  if (anio === "") return true;
  const n = Number(anio);
  return /^\d{4}$/.test(anio) && n >= 1950 && n <= new Date().getFullYear() + 1;
}

export default function NuevoTrabajo() {
  const [parametros, setParametros] = useSearchParams();
  const idClienteFijo = parametros.get("cliente");
  const [datos, setDatos] = useState(() => ({
    ...VACIO,
    placa: parametros.get("placa") ?? "",
    cuando: parametros.get("visita") === "pasada" ? "pasada" : null,
  }));
  // Viene de la ficha del cliente: ya se sabe qué carro o de quién.
  const [desdeFicha, setDesdeFicha] = useState(() => parametros.has("placa") || parametros.has("cliente"));
  // El cliente que viene de su ficha: undefined = cargando, null = ninguno.
  const [clienteFijo, setClienteFijo] = useState(idClienteFijo ? undefined : null);
  const [indice, setIndice] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [recibido, setRecibido] = useState(null);

  useEffect(() => {
    if (!idClienteFijo) return;
    let vigente = true;
    obtenerClienteBasico(idClienteFijo)
      .then((c) => vigente && setClienteFijo(c ?? null))
      .catch(() => vigente && setClienteFijo(null));
    return () => {
      vigente = false;
    };
  }, [idClienteFijo]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  // Búsquedas mientras escribe. Si el carro se escogió de la lista ya se sabe
  // todo de él y no hace falta buscar la placa.
  const registrado = datos.tipo === "registrado";
  const placa = normalizarPlaca(datos.placa);
  const busquedaPlaca = useBusqueda(!registrado && placa.length >= 3 ? placa : null, buscarVehiculoPorPlaca);
  const telefono = soloDigitos(datos.telefono);
  const busquedaTelefono = useBusqueda(telefono.length === 8 ? telefono : null, buscarClientesPorTelefono, 250);

  const vehiculo = registrado
    ? datos.carroElegido
    : busquedaPlaca.estado === "listo"
      ? busquedaPlaca.resultado
      : null;
  const carroConocido = Boolean(vehiculo);
  const carroConDueno = carroConocido && Boolean(vehiculo.cliente_id);
  const necesitaCliente = !carroConDueno && !clienteFijo;
  const encontrados = busquedaTelefono.resultado ?? [];
  const clienteElegido =
    datos.eleccionCliente && datos.eleccionCliente !== "nuevo" ? datos.eleccionCliente : null;
  const clienteNuevo =
    datos.eleccionCliente === "nuevo" || (busquedaTelefono.estado === "listo" && encontrados.length === 0);

  const pasada = datos.cuando === "pasada";
  const pasos = [
    ...(desdeFicha ? [] : ["tipo"]),
    registrado ? "elegir" : "placa",
    ...(necesitaCliente ? ["telefono"] : []),
    ...(necesitaCliente && clienteNuevo ? ["nombre"] : []),
    ...(carroConocido ? [] : ["carro"]),
    "cuando",
    "problema",
    ...(datos.cuando === "ya" || pasada ? ["llegada"] : []),
    ...(pasada ? ["cobro"] : []),
    "resumen",
  ];
  const posicion = Math.min(indice, pasos.length - 1);
  const paso = pasos[posicion];

  const reiniciar = () => {
    setParametros({}, { replace: true });
    setDesdeFicha(false);
    setClienteFijo(null);
    setDatos(VACIO);
    setIndice(0);
    setRecibido(null);
    setError("");
  };

  if (recibido) {
    return <CarroRecibido {...recibido} alRecibirOtro={reiniciar} />;
  }

  const nombreCliente = carroConDueno
    ? vehiculo.cliente_nombre
    : (clienteFijo?.nombre ?? clienteElegido?.nombre ?? (clienteNuevo ? datos.nombre.trim() : null));
  const telefonoCliente = carroConDueno
    ? vehiculo.cliente_telefono
    : clienteFijo
      ? clienteFijo.telefono
      : telefono;
  // La unidad del tablero: la que se escogió o, si no, la que ya tiene el carro.
  const llegada = { ...datos.llegada, unidad: datos.llegada.unidad ?? vehiculo?.unidad_distancia ?? "km" };
  const km = kmLlegada(llegada);
  const monto = montoDe(datos.monto);
  const textoCuando =
    datos.cuando === "ya"
      ? "Ya está aquí"
      : pasada
        ? fechaVisita(datos.fecha)
          ? `Vino el ${fechaLarga(fechaVisita(datos.fecha))} (ya se fue)`
          : ""
        : datos.cuando
          ? `Cita: ${fechaLarga(fechaCita(datos.cuando, datos.fecha))}`
          : "";
  const textoCobro =
    monto === 0
      ? "No se anota cuánto se cobró"
      : datos.pagado === "si"
        ? `${formatoColones(monto)} · pagó con ${textoMetodo(datos.metodo)}`
        : `${formatoColones(monto)} · quedó debiendo` +
          (datos.proximoPago ? ` · próximo pago el ${fechaLarga(fechaInputAISO(datos.proximoPago))}` : "");

  const guardar = async () => {
    setGuardando(true);
    setError("");
    const comunes = {
      vehiculoId: vehiculo?.id,
      placa: vehiculo?.placa ?? datos.placa,
      marca: datos.marca,
      modelo: datos.modelo,
      anio: datos.anio ? Number(datos.anio) : null,
      tipoMotor: datos.tipoMotor,
      clienteId: carroConDueno ? null : (clienteFijo?.id ?? clienteElegido?.id),
      clienteNombre: necesitaCliente && clienteNuevo ? datos.nombre : null,
      clienteTelefono: necesitaCliente && clienteNuevo ? telefono : null,
    };
    try {
      const trabajoId = pasada
        ? await anotarVisitaPasada({
            ...comunes,
            fecha: fechaVisita(datos.fecha),
            trabajo: datos.problema,
            km,
            unidad: llegada.unidad,
            monto,
            pagado: datos.pagado !== "no",
            metodo: monto > 0 && datos.pagado === "si" ? datos.metodo : null,
            proximoPago: monto > 0 && datos.pagado === "no" ? datos.proximoPago || null : null,
          })
        : await recibirCarro({
            ...comunes,
            problema: datos.problema,
            yaEsta: datos.cuando === "ya",
            fechaCita: datos.cuando === "ya" ? null : fechaCita(datos.cuando, datos.fecha),
            ...(datos.cuando === "ya" ? datosLlegada(llegada) : {}),
          });
      setRecibido({
        trabajoId,
        placa: vehiculo?.placa?.toUpperCase() ?? datos.placa.trim().toUpperCase(),
        tipo: pasada ? "pasada" : datos.cuando === "ya" ? "aqui" : "cita",
      });
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setGuardando(false);
    }
  };

  // Qué se sabe del carro escogido o escrito: si ya está en el taller o si ya vino.
  const avisoCarro = (
    <>
      {vehiculo?.trabajo_activo_id && !pasada && (
        <Aviso
          tipo="alerta"
          titulo="Este carro ya está en el taller"
          accion={
            <Link to={`/trabajos/${vehiculo.trabajo_activo_id}`} className="text-lg font-bold text-rojo underline underline-offset-4">
              Ver el trabajo
            </Link>
          }
        >
          {nombreCarro(vehiculo)} · {vehiculo.cliente_nombre ?? "sin dueño anotado"}
        </Aviso>
      )}
      {vehiculo && (!vehiculo.trabajo_activo_id || pasada) && (
        <Aviso tipo="bien" titulo="Este carro ya vino antes">
          {nombreCarro(vehiculo)} · {vehiculo.cliente_nombre ?? "sin dueño anotado"}
          {clienteFijo && !vehiculo.cliente_id && <p>Se anota como carro de {clienteFijo.nombre}.</p>}
          {clienteFijo && vehiculo.cliente_id && vehiculo.cliente_id !== clienteFijo.id && (
            <p className="font-bold text-tinta">
              Ojo: este carro está a nombre de {vehiculo.cliente_nombre}, no de {clienteFijo.nombre}. El trabajo
              se anota a {vehiculo.cliente_nombre}.
            </p>
          )}
        </Aviso>
      )}
    </>
  );

  const configuracion = {
    tipo: {
      pregunta: "¿El carro ya está registrado?",
      ayuda: "Si ya vino antes, lo busca por el nombre del dueño.",
      puedeSeguir: datos.tipo !== null,
      contenido: (
        <div className="flex flex-col gap-3">
          {[
            { valor: "registrado", titulo: "Sí, ya está registrado", ayuda: "Lo busco por el nombre del dueño", icono: ListChecks },
            { valor: "nuevo", titulo: "No, es la primera vez", ayuda: "Anoto la placa, el dueño y el carro", icono: CarFront },
          ].map((opcion) => (
            <Eleccion
              key={opcion.valor}
              {...opcion}
              elegida={datos.tipo === opcion.valor}
              onClick={() =>
                setDatos((d) =>
                  d.tipo === opcion.valor ? d : { ...d, tipo: opcion.valor, placa: "", carroElegido: null }
                )
              }
            />
          ))}
        </div>
      ),
    },

    elegir: {
      pregunta: "¿De quién es el carro?",
      ayuda: "Toque el carro en la lista.",
      puedeSeguir: Boolean(vehiculo) && (!vehiculo.trabajo_activo_id || pasada),
      contenido: (
        <>
          <div className="mb-6 empty:hidden">{avisoCarro}</div>
          <ElegirCarro
            elegidoId={vehiculo?.id}
            alElegir={(carro) => {
              setDatos((d) => ({ ...d, carroElegido: carro }));
              // Si se puede, sigue de una (los botones quedan abajo de la lista);
              // si ya está en el taller, sube para que vea el aviso.
              if (carro.trabajo_activo_id && !pasada) window.scrollTo({ top: 0, behavior: "smooth" });
              else setIndice(posicion + 1);
            }}
          />
        </>
      ),
    },

    placa: {
      pregunta: "¿Cuál es la placa del carro?",
      ayuda: clienteFijo ? `Un carro de ${clienteFijo.nombre}.` : undefined,
      puedeSeguir: busquedaPlaca.estado === "listo" && (!vehiculo?.trabajo_activo_id || pasada) && clienteFijo !== undefined,
      contenido: (
        <>
          <Campo
            etiqueta="Placa"
            grande
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            placeholder="BTR-482"
            value={datos.placa}
            onChange={cambiar("placa")}
          />
          {busquedaPlaca.estado === "buscando" && <Aviso tipo="buscando" titulo="Buscando la placa…" />}
          {busquedaPlaca.estado === "error" && (
            <Aviso tipo="alerta" titulo="No se pudo buscar la placa">
              Revise el internet e intente de nuevo.
            </Aviso>
          )}
          {avisoCarro}
          {busquedaPlaca.estado === "listo" && !vehiculo && (
            <Aviso titulo="Carro nuevo">
              {clienteFijo
                ? `Se anota como carro de ${clienteFijo.nombre}.`
                : "En los siguientes pasos anotamos de quién es."}
            </Aviso>
          )}
        </>
      ),
    },

    telefono: {
      pregunta: "¿Cuál es el teléfono del cliente?",
      ayuda: carroConocido ? "Este carro no tiene dueño anotado todavía." : undefined,
      puedeSeguir:
        busquedaTelefono.estado === "listo" && (encontrados.length === 0 || datos.eleccionCliente !== null),
      contenido: (
        <>
          <Campo
            etiqueta="Teléfono"
            grande
            autoFocus
            inputMode="numeric"
            autoComplete="off"
            placeholder="8888 8888"
            ayuda={telefono.length > 0 && telefono.length < 8 ? `Faltan ${8 - telefono.length} números.` : undefined}
            value={datos.telefono}
            onChange={(e) => setDatos((d) => ({ ...d, telefono: e.target.value, eleccionCliente: null }))}
          />
          {busquedaTelefono.estado === "buscando" && <Aviso tipo="buscando" titulo="Buscando el teléfono…" />}
          {busquedaTelefono.estado === "listo" && encontrados.length > 0 && (
            <div className="aparecer mt-6 flex flex-col gap-3">
              <p className="text-lg font-bold">Ese teléfono ya está anotado. ¿Es este cliente?</p>
              {encontrados.map((c) => (
                <Eleccion
                  key={c.id}
                  icono={User}
                  titulo={`Sí, es ${c.nombre}`}
                  ayuda={formatoTelefono(c.telefono)}
                  elegida={clienteElegido?.id === c.id}
                  onClick={() => setDatos((d) => ({ ...d, eleccionCliente: c }))}
                />
              ))}
              <Eleccion
                icono={UserPlus}
                titulo="No, es otra persona"
                elegida={datos.eleccionCliente === "nuevo"}
                onClick={() => setDatos((d) => ({ ...d, eleccionCliente: "nuevo" }))}
              />
            </div>
          )}
          {busquedaTelefono.estado === "listo" && encontrados.length === 0 && (
            <Aviso titulo="Cliente nuevo">En el siguiente paso anota su nombre.</Aviso>
          )}
        </>
      ),
    },

    nombre: {
      pregunta: "¿Cómo se llama el cliente?",
      puedeSeguir: datos.nombre.trim().length >= 2,
      contenido: (
        <Campo
          etiqueta="Nombre del cliente"
          autoFocus
          autoComplete="off"
          placeholder="Carlos Rojas"
          value={datos.nombre}
          onChange={cambiar("nombre")}
        />
      ),
    },

    carro: {
      pregunta: "¿Qué carro es?",
      ayuda: "Si no lo sabe, déjelo en blanco y siga.",
      puedeSeguir: anioValido(datos.anio),
      contenido: (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etiqueta="Marca" opcional autoFocus placeholder="Toyota" value={datos.marca} onChange={cambiar("marca")} />
          <Campo etiqueta="Modelo" opcional placeholder="Hilux" value={datos.modelo} onChange={cambiar("modelo")} />
          <Campo
            etiqueta="Año"
            opcional
            inputMode="numeric"
            maxLength={4}
            placeholder="2012"
            value={datos.anio}
            onChange={cambiar("anio")}
            error={anioValido(datos.anio) ? undefined : "Escriba el año con 4 números, por ejemplo 2012."}
          />
          <div className="sm:col-span-2">
            <CampoMotor valor={datos.tipoMotor} alCambiar={(valor) => setDatos((d) => ({ ...d, tipoMotor: valor }))} />
          </div>
        </div>
      ),
    },

    cuando: {
      pregunta: "¿Cuándo viene el carro?",
      ayuda: "Si ya vino y se fue, escoja la última opción para anotarlo en el historial.",
      puedeSeguir:
        datos.cuando !== null &&
        (datos.cuando === "ya" ||
          (pasada ? fechaVisita(datos.fecha) !== null : fechaCita(datos.cuando, datos.fecha) !== null)),
      contenido: (
        <div className="flex flex-col gap-3">
          {CUANDO.map((opcion) => (
            <Eleccion
              key={opcion.valor}
              {...opcion}
              elegida={datos.cuando === opcion.valor}
              onClick={() =>
                setDatos((d) =>
                  d.cuando === opcion.valor
                    ? d
                    : // La fecha de una cita y la de una visita pasada no se mezclan.
                      { ...d, cuando: opcion.valor, fecha: (d.cuando === "pasada") === (opcion.valor === "pasada") ? d.fecha : "" }
                )
              }
            />
          ))}
          {datos.cuando === "fecha" && (
            <Campo
              className="aparecer mt-2"
              etiqueta="Día de la cita"
              type="date"
              min={isoAFechaInput(new Date().toISOString())}
              value={datos.fecha}
              onChange={cambiar("fecha")}
            />
          )}
          {pasada && (
            <Campo
              className="aparecer mt-2"
              etiqueta="¿Qué día vino?"
              type="date"
              max={isoAFechaInput(new Date().toISOString())}
              value={datos.fecha}
              onChange={cambiar("fecha")}
            />
          )}
        </div>
      ),
    },

    problema: pasada
      ? {
          pregunta: "¿Qué se le hizo al carro?",
          ayuda: "Así queda en el historial del carro.",
          puedeSeguir: datos.problema.trim() !== "",
          contenido: (
            <Campo
              etiqueta="Lo que se le hizo"
              multilinea
              autoFocus
              placeholder="Por ejemplo: cambio de aceite y filtros, pastillas delanteras…"
              value={datos.problema}
              onChange={cambiar("problema")}
            />
          ),
        }
      : {
          pregunta: "¿Qué le pasa al carro?",
          ayuda: "Escríbalo como lo dice el cliente.",
          puedeSeguir: datos.problema.trim() !== "",
          contenido: (
            <Campo
              etiqueta="Lo que dice el cliente"
              multilinea
              autoFocus
              placeholder="Por ejemplo: suena al frenar, no arranca en frío, cambio de aceite…"
              value={datos.problema}
              onChange={cambiar("problema")}
            />
          ),
        },

    llegada: {
      pregunta: pasada ? "¿Cuánto marcaba el tablero?" : "¿Cómo llegó el carro?",
      ayuda: pasada
        ? "Lo que marcaba ese día, en kilómetros o millas."
        : "Anote lo que marca el tablero. La gasolina y las notas son opcionales.",
      puedeSeguir: llegadaLista(llegada),
      contenido: (
        <CamposLlegada
          grande
          soloLectura={pasada}
          valores={llegada}
          alCambiar={(cambio) => setDatos((d) => ({ ...d, llegada: { ...d.llegada, ...cambio } }))}
        />
      ),
    },

    cobro: {
      pregunta: "¿Cuánto se le cobró?",
      ayuda: "Si no se acuerda, déjelo en blanco y siga.",
      puedeSeguir: monto === 0 || (datos.pagado === "si" && datos.metodo !== null) || datos.pagado === "no",
      contenido: (
        <div className="flex flex-col gap-5">
          <CampoMonto
            etiqueta="Lo que se cobró"
            opcional
            autoFocus
            valor={datos.monto}
            alCambiar={(valor) => setDatos((d) => ({ ...d, monto: valor }))}
          />
          {monto > 0 && (
            <fieldset className="aparecer flex flex-col gap-3">
              <legend className="mb-2 text-lg font-bold">¿Ya lo pagó?</legend>
              <Eleccion
                icono={CheckCircle2}
                titulo="Sí, pagó todo"
                elegida={datos.pagado === "si"}
                onClick={() => setDatos((d) => ({ ...d, pagado: "si" }))}
              />
              <Eleccion
                icono={Clock}
                titulo="No, quedó debiendo"
                ayuda="Sale en «Quién debe» para anotar los abonos"
                elegida={datos.pagado === "no"}
                onClick={() => setDatos((d) => ({ ...d, pagado: "no" }))}
              />
            </fieldset>
          )}
          {monto > 0 && datos.pagado === "si" && (
            <ElegirMetodo valor={datos.metodo} alCambiar={(metodo) => setDatos((d) => ({ ...d, metodo }))} />
          )}
          {monto > 0 && datos.pagado === "no" && (
            <Campo
              className="aparecer"
              etiqueta="¿Cuándo es el próximo pago?"
              opcional
              type="date"
              value={datos.proximoPago}
              onChange={cambiar("proximoPago")}
            />
          )}
        </div>
      ),
    },

    resumen: {
      pregunta: "¿Está todo bien?",
      ayuda: "Revise los datos y toque «Guardar».",
      puedeSeguir: true,
      contenido: (
        <>
          <Resumen
            alCambiar={(p) => setIndice(pasos.indexOf(p))}
            filas={[
              { etiqueta: "Placa", valor: vehiculo?.placa?.toUpperCase() ?? datos.placa.trim().toUpperCase(), esPlaca: true, paso: registrado ? "elegir" : "placa" },
              {
                etiqueta: "Carro",
                valor: carroConocido ? nombreCarro(vehiculo) : nombreCarro(datos),
                paso: carroConocido ? null : "carro",
              },
              ...(!carroConocido && datos.tipoMotor.trim()
                ? [{ etiqueta: "Motor", valor: datos.tipoMotor.trim(), paso: "carro" }]
                : []),
              {
                etiqueta: "Cliente",
                valor: `${nombreCliente ?? "Sin dueño anotado"}${telefonoCliente ? ` · ${formatoTelefono(telefonoCliente)}` : ""}`,
                paso: necesitaCliente ? "telefono" : null,
              },
              { etiqueta: "Cuándo", valor: textoCuando, paso: "cuando" },
              { etiqueta: pasada ? "Qué se le hizo" : "Qué le pasa", valor: datos.problema.trim(), paso: "problema" },
              ...(datos.cuando === "ya" || pasada
                ? [
                    {
                      etiqueta: llegada.unidad === "mi" ? "Millaje" : "Kilometraje",
                      valor: km === null ? "No se pudo ver el tablero" : formatoDistancia(km, llegada.unidad),
                      paso: "llegada",
                    },
                    ...(pasada ? [{ etiqueta: "Cobro", valor: textoCobro, paso: "cobro" }] : []),
                    ...(datos.llegada.gasolina
                      ? [{ etiqueta: "Gasolina", valor: TEXTO_GASOLINA[datos.llegada.gasolina], paso: "llegada" }]
                      : []),
                    ...(datos.llegada.notas.trim()
                      ? [{ etiqueta: "Cómo llegó", valor: datos.llegada.notas.trim(), paso: "llegada" }]
                      : []),
                  ]
                : []),
            ]}
          />
          {error && (
            <p role="alert" className="aparecer mt-5 rounded-control border-2 border-rojo/30 bg-rojo/5 p-4 text-lg font-bold text-rojo">
              {error}
            </p>
          )}
        </>
      ),
    },
  };

  const actual = configuracion[paso];
  const esResumen = paso === "resumen";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="etiqueta mb-3">{pasada ? "Anotar una visita que ya pasó" : "Agregar un carro al sistema"}</h1>
      <Asistente
        paso={posicion + 1}
        total={pasos.length}
        pregunta={actual.pregunta}
        ayuda={actual.ayuda}
        puedeSeguir={actual.puedeSeguir}
        cargando={guardando}
        textoSiguiente={esResumen ? "Guardar" : "Siguiente"}
        alAtras={() => setIndice(posicion - 1)}
        alSiguiente={() => (esResumen ? guardar() : setIndice(posicion + 1))}
      >
        {actual.contenido}
      </Asistente>
    </div>
  );
}
