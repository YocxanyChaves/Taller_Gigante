import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, Car, CarFront, EyeOff, ListChecks, Sun, Sunrise, UserPlus, User } from "lucide-react";
import { buscarVehiculoPorPlaca, buscarClientesPorTelefono, recibirCarro } from "../services/trabajos";
import { obtenerClienteBasico } from "../services/clientes";
import useBusqueda from "../lib/useBusqueda";
import { mensajeError } from "../lib/errores";
import {
  normalizarPlaca,
  soloDigitos,
  formatoTelefono,
  formatoKm,
  nombreCarro,
  fechaLarga,
  isoAFechaInput,
} from "../lib/formato";
import Asistente from "../components/ui/Asistente";
import Campo from "../components/ui/Campo";
import Aviso from "../components/ui/Aviso";
import Eleccion from "../components/ui/Eleccion";
import Resumen from "../components/recibir/Resumen";
import CarroRecibido from "../components/recibir/CarroRecibido";
import ElegirCarro from "../components/recibir/ElegirCarro";

// "Agregar un carro al sistema": una pregunta por pantalla. Primero pregunta si
// el carro ya está registrado: si sí, se escoge de la lista por el nombre del
// dueño (el tío conoce los carros por la persona); si no, se anota la placa.
// Si el carro ya vino, se saltan el teléfono y los datos del carro. Si ya
// está aquí, se pide el kilometraje (en una cita se pide cuando llega). Los pasos
// se arman solos según lo que se va encontrando.
// Desde la ficha del cliente llega con ?placa= (ese carro) o ?cliente= (un
// carro de ese cliente): entonces no se pregunta nada de eso.

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
  problema: "",
  cuando: null, // "ya" | "hoy" | "manana" | "fecha"
  fecha: "",
  km: "",
  sinKm: false, // no se puede ver el tablero
};

const CUANDO = [
  { valor: "ya", titulo: "Ya está aquí", ayuda: "Lo reviso ahora", icono: Car },
  { valor: "hoy", titulo: "Hoy", ayuda: "Viene más tarde", icono: Sun },
  { valor: "manana", titulo: "Mañana", icono: Sunrise },
  { valor: "fecha", titulo: "Escoger otro día", icono: CalendarDays },
];

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
  const [datos, setDatos] = useState(() => ({ ...VACIO, placa: parametros.get("placa") ?? "" }));
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

  const pasos = [
    ...(desdeFicha ? [] : ["tipo"]),
    registrado ? "elegir" : "placa",
    ...(necesitaCliente ? ["telefono"] : []),
    ...(necesitaCliente && clienteNuevo ? ["nombre"] : []),
    ...(carroConocido ? [] : ["carro"]),
    "problema",
    "cuando",
    ...(datos.cuando === "ya" ? ["km"] : []),
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
  const km = soloDigitos(datos.km) ? Number(soloDigitos(datos.km)) : null;
  const textoCuando =
    datos.cuando === "ya"
      ? "Ya está aquí"
      : datos.cuando
        ? `Cita: ${fechaLarga(fechaCita(datos.cuando, datos.fecha))}`
        : "";

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      const trabajoId = await recibirCarro({
        problema: datos.problema,
        yaEsta: datos.cuando === "ya",
        fechaCita: datos.cuando === "ya" ? null : fechaCita(datos.cuando, datos.fecha),
        vehiculoId: vehiculo?.id,
        placa: vehiculo?.placa ?? datos.placa,
        marca: datos.marca,
        modelo: datos.modelo,
        anio: datos.anio ? Number(datos.anio) : null,
        clienteId: carroConDueno ? null : (clienteFijo?.id ?? clienteElegido?.id),
        clienteNombre: necesitaCliente && clienteNuevo ? datos.nombre : null,
        clienteTelefono: necesitaCliente && clienteNuevo ? telefono : null,
        km: datos.cuando === "ya" ? km : null,
      });
      setRecibido({
        trabajoId,
        placa: vehiculo?.placa?.toUpperCase() ?? datos.placa.trim().toUpperCase(),
        esCita: datos.cuando !== "ya",
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
      {vehiculo?.trabajo_activo_id && (
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
      {vehiculo && !vehiculo.trabajo_activo_id && (
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
      puedeSeguir: Boolean(vehiculo) && !vehiculo.trabajo_activo_id,
      contenido: (
        <>
          <div className="mb-6 empty:hidden">{avisoCarro}</div>
          <ElegirCarro
            elegidoId={vehiculo?.id}
            alElegir={(carro) => {
              setDatos((d) => ({ ...d, carroElegido: carro }));
              // Si se puede, sigue de una (los botones quedan abajo de la lista);
              // si ya está en el taller, sube para que vea el aviso.
              if (carro.trabajo_activo_id) window.scrollTo({ top: 0, behavior: "smooth" });
              else setIndice(posicion + 1);
            }}
          />
        </>
      ),
    },

    placa: {
      pregunta: "¿Cuál es la placa del carro?",
      ayuda: clienteFijo ? `Un carro de ${clienteFijo.nombre}.` : undefined,
      puedeSeguir: busquedaPlaca.estado === "listo" && !vehiculo?.trabajo_activo_id && clienteFijo !== undefined,
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
        </div>
      ),
    },

    problema: {
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

    cuando: {
      pregunta: "¿Cuándo viene el carro?",
      puedeSeguir: datos.cuando !== null && (datos.cuando === "ya" || fechaCita(datos.cuando, datos.fecha) !== null),
      contenido: (
        <div className="flex flex-col gap-3">
          {CUANDO.map((opcion) => (
            <Eleccion
              key={opcion.valor}
              {...opcion}
              elegida={datos.cuando === opcion.valor}
              onClick={() => setDatos((d) => ({ ...d, cuando: opcion.valor }))}
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
        </div>
      ),
    },

    km: {
      pregunta: "¿Cuánto kilometraje marca?",
      ayuda: "Véalo en el tablero del carro.",
      puedeSeguir: km !== null || datos.sinKm,
      contenido: (
        <div className="flex flex-col gap-5">
          <Campo
            etiqueta="Kilometraje"
            grande
            autoFocus
            inputMode="numeric"
            autoComplete="off"
            placeholder="85 000"
            value={datos.km}
            onChange={(e) => setDatos((d) => ({ ...d, km: e.target.value, sinKm: false }))}
          />
          <Eleccion
            icono={EyeOff}
            titulo="No se puede ver el tablero"
            ayuda="Sigo sin anotarlo"
            elegida={datos.sinKm}
            onClick={() => setDatos((d) => ({ ...d, sinKm: !d.sinKm, km: "" }))}
          />
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
              {
                etiqueta: "Cliente",
                valor: `${nombreCliente ?? "Sin dueño anotado"}${telefonoCliente ? ` · ${formatoTelefono(telefonoCliente)}` : ""}`,
                paso: necesitaCliente ? "telefono" : null,
              },
              { etiqueta: "Qué le pasa", valor: datos.problema.trim(), paso: "problema" },
              { etiqueta: "Cuándo", valor: textoCuando, paso: "cuando" },
              ...(datos.cuando === "ya" ? [{ etiqueta: "Kilometraje", valor: km === null ? "No se pudo ver el tablero" : formatoKm(km), paso: "km" }] : []),
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
      <h1 className="etiqueta mb-3">Agregar un carro al sistema</h1>
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
