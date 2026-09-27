import { useState } from "react";
import { Check, Plus, Trash2, Pencil, Car, List, Search } from "lucide-react";
import { ESTADOS } from "../lib/estados";
import { formatoColones } from "../lib/formato";
import Encabezado from "../components/layout/Encabezado";
import Ventana from "../components/ui/Ventana";
import Boton from "../components/ui/Boton";
import Campo from "../components/ui/Campo";
import TarjetaNumero from "../components/ui/TarjetaNumero";
import Insignia from "../components/ui/Insignia";
import Placa from "../components/ui/Placa";
import OpcionMenu from "../components/ui/OpcionMenu";
import Asistente from "../components/ui/Asistente";
import Confirmar from "../components/ui/Confirmar";
import Confeti from "../components/ui/Confeti";
import Vacio from "../components/ui/Vacio";

// Muestrario de todo el sistema de diseño, para revisarlo con la dueña antes
// de construir pantallas. Solo admin.

const COLORES = [
  ["fondo", "bg-fondo"],
  ["tarjeta", "bg-tarjeta"],
  ["suave", "bg-suave"],
  ["linea", "bg-linea"],
  ["gris", "bg-gris"],
  ["tinta", "bg-tinta"],
  ["rojo", "bg-rojo"],
];

const SEMAFORO = [
  ["verde · listo", "bg-verde"],
  ["amarillo · trabajando", "bg-amarillo"],
  ["rojo · esperando algo", "bg-semaforo-rojo"],
];

function EjemploAsistente() {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState({ placa: "", telefono: "", problema: "" });
  const [listo, setListo] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  if (listo) {
    return (
      <div className="relative">
        <Confeti />
        <div className="aparecer flex flex-col items-center rounded-tarjeta border border-linea bg-tarjeta px-6 py-12 text-center">
          <span className="grid size-20 place-items-center rounded-full bg-verde text-white">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="dibujar" d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <p className="mt-5 text-3xl font-bold">¡Carro recibido!</p>
          <p className="mt-2 text-lg text-gris">Así termina el asistente. En la fase 3 aquí se guarda de verdad.</p>
          <Boton
            variante="secundario"
            className="mt-7"
            onClick={() => {
              setListo(false);
              setPaso(1);
            }}
          >
            Probar otra vez
          </Boton>
        </div>
      </div>
    );
  }

  const pasos = {
    1: {
      pregunta: "¿Cuál es la placa del carro?",
      contenido: (
        <Campo etiqueta="Placa" grande placeholder="BTR-482" value={datos.placa} onChange={cambiar("placa")} />
      ),
      puedeSeguir: datos.placa.trim() !== "",
    },
    2: {
      pregunta: "¿Cuál es el teléfono del cliente?",
      contenido: (
        <Campo
          etiqueta="Teléfono"
          grande
          inputMode="numeric"
          placeholder="8888 8888"
          value={datos.telefono}
          onChange={cambiar("telefono")}
        />
      ),
      puedeSeguir: datos.telefono.replace(/\D/g, "").length === 8,
    },
    3: {
      pregunta: "¿Qué le pasa al carro?",
      contenido: (
        <Campo
          etiqueta="Lo que dice el cliente"
          multilinea
          placeholder="Por ejemplo: suena al frenar, no enciende, cambio de aceite…"
          value={datos.problema}
          onChange={cambiar("problema")}
        />
      ),
      puedeSeguir: datos.problema.trim() !== "",
    },
  };

  const actual = pasos[paso];

  return (
    <Asistente
      paso={paso}
      total={3}
      pregunta={actual.pregunta}
      puedeSeguir={actual.puedeSeguir}
      textoSiguiente={paso === 3 ? "Guardar" : "Siguiente"}
      alAtras={() => setPaso((p) => p - 1)}
      alSiguiente={() => (paso === 3 ? setListo(true) : setPaso((p) => p + 1))}
    >
      {actual.contenido}
    </Asistente>
  );
}

export default function Estilos() {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <>
      <Encabezado titulo="Estilos">
        Todas las piezas del sistema en un solo lugar. Revise cómo se ven y avise qué cambiar.
      </Encabezado>

      <div className="flex flex-col gap-8">
        <Ventana titulo="Colores">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {COLORES.map(([nombre, clase]) => (
              <div key={nombre}>
                <div className={`h-16 rounded-control border border-linea ${clase}`} />
                <p className="mt-1.5 text-base text-gris">{nombre}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-lg font-bold">Semáforo del proceso del carro</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            {SEMAFORO.map(([nombre, clase]) => (
              <div key={nombre} className="flex items-center gap-3">
                <span className={`size-10 shrink-0 rounded-full ${clase}`} />
                <span className="text-lg">{nombre}</span>
              </div>
            ))}
          </div>
        </Ventana>

        <Ventana titulo="Letra">
          <p className="text-4xl font-bold">Atkinson Hyperlegible</p>
          <p className="mt-3 text-lg">
            Hecha para leerse sin esfuerzo: la I, la l y el 1 no se confunden, ni el 0 con la O.
          </p>
          <p className="numeros mt-3 text-3xl font-bold text-rojo">₡540 000</p>
        </Ventana>

        <Ventana titulo="Botones">
          <div className="flex flex-wrap items-center gap-4">
            <Boton icono={Plus}>Principal</Boton>
            <Boton variante="secundario" icono={Pencil}>
              Secundario
            </Boton>
            <Boton variante="peligro" icono={Trash2}>
              Peligro
            </Boton>
            <Boton variante="gris">Gris</Boton>
            <Boton disabled>Desactivado</Boton>
          </div>
          <p className="mt-4 text-base text-gris">
            Pase el mouse: se levantan y el ícono se menea. Solo un botón rojo por pantalla.
          </p>
        </Ventana>

        <Ventana titulo="Semáforo de estados">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.keys(ESTADOS).map((estado) => (
              <Insignia key={estado} estado={estado} />
            ))}
          </div>
          <div className="mt-6 border-t border-linea pt-6">
            <Insignia estado="esperando_aprobacion" grande />
          </div>
        </Ventana>

        <Ventana titulo="Menú de Inicio">
          <div className="flex max-w-2xl flex-col gap-3">
            <OpcionMenu to="/estilos" icono={Plus} titulo="Recibir un carro" ayuda="Anotar el carro y lo que tiene" destacada />
            <OpcionMenu to="/estilos" icono={List} titulo="Carros en el taller" ayuda="Ver en qué va cada trabajo" retraso={70} />
            <OpcionMenu to="/estilos" icono={Search} titulo="Buscar un cliente" ayuda="Por placa, nombre o teléfono" retraso={140} />
          </div>
        </Ventana>

        <Ventana titulo="Placas y números">
          <div className="flex flex-wrap items-center gap-4">
            <Placa>BTR-482</Placa>
            <Placa>318204</Placa>
            <Placa grande>CL-2291</Placa>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TarjetaNumero etiqueta="En el taller" valor={7} detalle="carros" />
            <TarjetaNumero etiqueta="Esperando respuesta" valor={2} color="rojo" detalle="clientes" />
            <TarjetaNumero etiqueta="Listos para recoger" valor={3} color="verde" detalle="carros" />
            <TarjetaNumero etiqueta="Por cobrar" valor={185000} formato={formatoColones} color="rojo" />
          </div>
          <p className="mt-4 text-base text-gris">Los números cuentan hacia arriba al aparecer.</p>
        </Ventana>

        <Ventana titulo="Campos">
          <div className="grid gap-6 md:grid-cols-2">
            <Campo etiqueta="Nombre del cliente" placeholder="Carlos Rojas" />
            <Campo etiqueta="Teléfono" inputMode="numeric" ayuda="8 números, sin guiones." />
            <Campo etiqueta="Placa" defaultValue="AB" error="La placa tiene que tener al menos 3 letras o números." />
            <Campo etiqueta="Marca" opcional placeholder="Toyota" />
          </div>
        </Ventana>

        <section>
          <h2 className="mb-3 text-2xl font-bold">Asistente paso a paso (pruébelo hasta el final)</h2>
          <div className="max-w-2xl">
            <EjemploAsistente />
          </div>
        </section>

        <Ventana titulo="Confirmar">
          <Boton variante="peligro" icono={Trash2} onClick={() => setConfirmando(true)}>
            Cancelar trabajo
          </Boton>
          <Confirmar
            abierto={confirmando}
            titulo="¿Cancelar este trabajo?"
            textoConfirmar="Sí, cancelarlo"
            peligro
            alConfirmar={() => setConfirmando(false)}
            alCancelar={() => setConfirmando(false)}
          >
            El trabajo del <strong className="text-tinta">Toyota Hilux BTR-482</strong> se va a cancelar y el cliente
            ya no lo va a ver en su link.
          </Confirmar>
        </Ventana>

        <Ventana titulo="Sin datos">
          <Vacio icono={Car} titulo="Todavía no hay carros en el taller">
            Toque «Recibir un carro» para anotar el primero.
          </Vacio>
        </Ventana>

        <p className="flex items-center gap-2 text-base text-gris">
          <Check aria-hidden="true" size={18} /> Si el celular tiene activado "reducir movimiento", las animaciones se
          apagan solas.
        </p>
      </div>
    </>
  );
}
