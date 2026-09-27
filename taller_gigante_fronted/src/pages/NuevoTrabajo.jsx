import { useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Car, Sun, Sunrise, UserPlus, User } from "lucide-react";
import { buscarVehiculoPorPlaca, buscarClientesPorTelefono, recibirCarro } from "../services/trabajos";
import useBusqueda from "../lib/useBusqueda";
import { mensajeError } from "../lib/errores";
import {
  normalizarPlaca,
  soloDigitos,
  formatoTelefono,
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

// "Recibir un carro": una pregunta por pantalla. Empieza por la placa porque
// casi siempre el carro ya vino antes; en ese caso se salta el teléfono y los
// datos del carro. Los pasos se arman solos según lo que se va encontrando.

const VACIO = {
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
  const [datos, setDatos] = useState(VACIO);
  const [indice, setIndice] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [recibido, setRecibido] = useState(null);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  // Búsquedas mientras escribe.
  const placa = normalizarPlaca(datos.placa);
  const busquedaPlaca = useBusqueda(placa.length >= 3 ? placa : null, buscarVehiculoPorPlaca);
  const telefono = soloDigitos(datos.telefono);
  const busquedaTelefono = useBusqueda(telefono.length === 8 ? telefono : null, buscarClientesPorTelefono, 250);

  const vehiculo = busquedaPlaca.estado === "listo" ? busquedaPlaca.resultado : null;
  const carroConocido = Boolean(vehiculo);
  const necesitaCliente = !carroConocido || !vehiculo.cliente_id;
  const encontrados = busquedaTelefono.resultado ?? [];
  const clienteElegido =
    datos.eleccionCliente && datos.eleccionCliente !== "nuevo" ? datos.eleccionCliente : null;
  const clienteNuevo =
    datos.eleccionCliente === "nuevo" || (busquedaTelefono.estado === "listo" && encontrados.length === 0);

  const pasos = [
    "placa",
    ...(necesitaCliente ? ["telefono"] : []),
    ...(necesitaCliente && clienteNuevo ? ["nombre"] : []),
    ...(carroConocido ? [] : ["carro"]),
    "problema",
    "cuando",
    "resumen",
  ];
  const posicion = Math.min(indice, pasos.length - 1);
  const paso = pasos[posicion];

  const reiniciar = () => {
    setDatos(VACIO);
    setIndice(0);
    setRecibido(null);
    setError("");
  };

  if (recibido) {
    return <CarroRecibido {...recibido} alRecibirOtro={reiniciar} />;
  }

  const nombreCliente = clienteElegido?.nombre ?? (clienteNuevo ? datos.nombre.trim() : vehiculo?.cliente_nombre);
  const telefonoCliente = necesitaCliente ? telefono : vehiculo?.cliente_telefono;
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
        placa: datos.placa,
        marca: datos.marca,
        modelo: datos.modelo,
        anio: datos.anio ? Number(datos.anio) : null,
        clienteId: necesitaCliente ? clienteElegido?.id : null,
        clienteNombre: necesitaCliente && clienteNuevo ? datos.nombre : null,
        clienteTelefono: necesitaCliente && clienteNuevo ? telefono : null,
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

  const configuracion = {
    placa: {
      pregunta: "¿Cuál es la placa del carro?",
      puedeSeguir: busquedaPlaca.estado === "listo" && !vehiculo?.trabajo_activo_id,
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
            </Aviso>
          )}
          {busquedaPlaca.estado === "listo" && !vehiculo && (
            <Aviso titulo="Carro nuevo">En los siguientes pasos anotamos de quién es.</Aviso>
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

    resumen: {
      pregunta: "¿Está todo bien?",
      ayuda: "Revise los datos y toque «Guardar».",
      puedeSeguir: true,
      contenido: (
        <>
          <Resumen
            alCambiar={(p) => setIndice(pasos.indexOf(p))}
            filas={[
              { etiqueta: "Placa", valor: vehiculo?.placa?.toUpperCase() ?? datos.placa.trim().toUpperCase(), esPlaca: true, paso: "placa" },
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
      <h1 className="etiqueta mb-3">Recibir un carro</h1>
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
