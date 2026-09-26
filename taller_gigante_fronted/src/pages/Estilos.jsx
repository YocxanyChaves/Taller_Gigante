import { useState } from "react";
import { Check, Plus, Trash2, Pencil, Car, Palette } from "lucide-react";
import { ESTADOS } from "../lib/estados";
import Encabezado from "../components/layout/Encabezado";
import Ventana from "../components/ui/Ventana";
import Boton from "../components/ui/Boton";
import Campo from "../components/ui/Campo";
import TarjetaNumero from "../components/ui/TarjetaNumero";
import Insignia from "../components/ui/Insignia";
import Asistente from "../components/ui/Asistente";
import Confirmar from "../components/ui/Confirmar";
import Vacio from "../components/ui/Vacio";

// Muestrario de todo el sistema de diseño, para revisarlo con la dueña antes
// de construir pantallas. Solo admin.

const COLORES = [
  ["fondo", "bg-fondo"],
  ["panel", "bg-panel"],
  ["panel-hundido", "bg-panel-hundido"],
  ["linea", "bg-linea"],
  ["acero", "bg-acero"],
  ["texto", "bg-texto"],
  ["rojo", "bg-rojo"],
  ["rojo-vivo", "bg-rojo-vivo"],
  ["azul", "bg-azul"],
  ["azul-vivo", "bg-azul-vivo"],
  ["cromo", "bg-cromo"],
];

function EjemploAsistente() {
  const [paso, setPaso] = useState(1);
  const [datos, setDatos] = useState({ telefono: "", placa: "", problema: "" });
  const [listo, setListo] = useState(false);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  if (listo) {
    return (
      <Vacio
        icono={Check}
        titulo="¡Listo!"
        accion={
          <Boton
            variante="secundario"
            onClick={() => {
              setListo(false);
              setPaso(1);
            }}
          >
            Probar otra vez
          </Boton>
        }
      >
        Así termina el asistente. En la fase 3 aquí se guarda el trabajo.
      </Vacio>
    );
  }

  const pasos = {
    1: {
      pregunta: "¿Cuál es el teléfono del cliente?",
      contenido: (
        <Campo
          etiqueta="Teléfono"
          inputMode="numeric"
          placeholder="8888 8888"
          value={datos.telefono}
          onChange={cambiar("telefono")}
        />
      ),
      puedeSeguir: datos.telefono.replace(/\D/g, "").length === 8,
    },
    2: {
      pregunta: "¿Cuál es la placa?",
      contenido: <Campo etiqueta="Placa" placeholder="ABC123" value={datos.placa} onChange={cambiar("placa")} />,
      puedeSeguir: datos.placa.trim() !== "",
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
      textoSiguiente={paso === 3 ? "Guardar trabajo" : "Siguiente"}
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

      <div className="flex flex-col gap-10">
        <Ventana titulo="Colores" icono={Palette}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {COLORES.map(([nombre, clase]) => (
              <div key={nombre}>
                <div className={`h-16 border-2 border-linea ${clase}`} />
                <p className="mt-1 font-mono text-base text-texto-2">{nombre}</p>
              </div>
            ))}
          </div>
          <div className="barra-titulo mt-6 h-10" />
          <p className="mt-1 text-base text-texto-2">Degradado de las barras de título (el único del sistema).</p>
          <div className="franja-peligro mt-6" />
          <p className="mt-1 text-base text-texto-2">Franja de advertencia (solo en el login y el botón de siguiente paso).</p>
        </Ventana>

        <Ventana titulo="Letras">
          <p className="rotulo text-4xl">Títulos: Barlow Condensed</p>
          <p className="mt-3 text-lg">
            Texto normal: Barlow, 18 px. El carro llegó con ruido en los frenos delanteros.
          </p>
          <p className="mt-3 font-mono text-3xl text-azul-vivo">₡540 000</p>
          <p className="text-base text-texto-2">Números y plata: JetBrains Mono.</p>
        </Ventana>

        <Ventana titulo="Botones">
          <div className="flex flex-wrap gap-5">
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
          <p className="mt-4 text-base text-texto-2">
            Tóquelos: se hunden. Solo un botón rojo por pantalla.
          </p>
        </Ventana>

        <Ventana titulo="Campos">
          <div className="grid gap-6 md:grid-cols-2">
            <Campo etiqueta="Nombre del cliente" placeholder="Carlos Pérez" />
            <Campo etiqueta="Teléfono" inputMode="numeric" ayuda="8 números, sin guiones." />
            <Campo etiqueta="Placa" defaultValue="AB-12" error="La placa tiene que tener al menos 3 letras o números." />
            <Campo etiqueta="Marca" opcional placeholder="Toyota" />
            <Campo etiqueta="Qué le pasa al carro" multilinea className="md:col-span-2" />
          </div>
        </Ventana>

        <Ventana titulo="Tarjetas de número">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <TarjetaNumero etiqueta="En el taller" valor="7" color="azul" detalle="carros" />
            <TarjetaNumero etiqueta="Esperando respuesta" valor="2" color="rojo" detalle="clientes" />
            <TarjetaNumero etiqueta="Listos para recoger" valor="3" color="cromo" detalle="carros" />
            <TarjetaNumero etiqueta="Por cobrar" valor="₡185 000" color="rojo" />
          </div>
        </Ventana>

        <Ventana titulo="Insignias de estado">
          <div className="flex flex-wrap gap-3">
            {Object.keys(ESTADOS).map((estado) => (
              <Insignia key={estado} estado={estado} />
            ))}
          </div>
          <div className="mt-5">
            <Insignia estado="esperando_aprobacion" grande />
          </div>
        </Ventana>

        <section>
          <h2 className="rotulo mb-3 text-2xl text-texto">Asistente paso a paso (pruébelo)</h2>
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
            titulo="Cancelar trabajo"
            textoConfirmar="Sí, cancelarlo"
            peligro
            alConfirmar={() => setConfirmando(false)}
            alCancelar={() => setConfirmando(false)}
          >
            ¿Cancelar el trabajo del <strong>Hyundai ABC123</strong>? El cliente ya no lo va a ver en su link.
          </Confirmar>
        </Ventana>

        <Ventana titulo="Sin datos">
          <Vacio icono={Car} titulo="Todavía no hay carros en el taller">
            Toque «Nuevo trabajo» para agregar el primero.
          </Vacio>
        </Ventana>
      </div>
    </>
  );
}
