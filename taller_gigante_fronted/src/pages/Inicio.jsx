import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, List, Search, Wallet, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { obtenerResumenInicio } from "../services/inicio";
import OpcionMenu from "../components/ui/OpcionMenu";
import Semaforo from "../components/ui/Semaforo";

// Inicio es un menú: "¿Qué desea hacer?" con las 4 cosas que se hacen en el
// taller, y abajo lo que hay para hoy.

const OPCIONES = [
  {
    to: "/trabajos/nuevo",
    icono: Plus,
    titulo: "Recibir un carro",
    ayuda: "Anotar el carro y lo que tiene",
    destacada: true,
  },
  { to: "/trabajos", icono: List, titulo: "Carros en el taller", ayuda: "Ver en qué va cada trabajo" },
  { to: "/clientes", icono: Search, titulo: "Buscar un cliente", ayuda: "Por placa, nombre o teléfono" },
  { to: "/cobros", icono: Wallet, titulo: "Cobrar y entregar", ayuda: "Hacer la cuenta y ver quién debe" },
];

function saludo() {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

// "Sábado 26 de setiembre" (en Costa Rica se dice "setiembre").
function fechaDeHoy() {
  const texto = new Date()
    .toLocaleDateString("es-CR", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", "")
    .replace("septiembre", "setiembre");
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function plural(n, uno, varios) {
  return `${n} ${n === 1 ? uno : varios}`;
}

export default function Inicio() {
  const { nombre } = useAuth();
  const primerNombre = nombre.split(" ")[0];
  const [resumen, setResumen] = useState(null);

  useEffect(() => {
    obtenerResumenInicio()
      .then(setResumen)
      .catch(() => setResumen(null)); // sin resumen, el menú igual funciona
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-lg text-gris">{fechaDeHoy()}</p>
      <h1 className="mt-1 text-4xl font-bold">
        {saludo()}
        {primerNombre && `, ${primerNombre}`}
      </h1>
      <p className="mt-2 text-xl text-gris">¿Qué desea hacer?</p>

      <nav aria-label="Qué desea hacer" className="mt-8 flex flex-col gap-3">
        {OPCIONES.map((opcion, i) => (
          <OpcionMenu key={opcion.to} {...opcion} retraso={80 + i * 70} />
        ))}
      </nav>

      {resumen && <ParaHoy resumen={resumen} />}
    </div>
  );
}

// Lo pendiente, del más urgente al menos urgente. Solo salen las líneas que
// tienen algo, cada una con su luz del semáforo encendida (o un calendario
// para las citas). Si no hay nada, se dice.
function ParaHoy({ resumen }) {
  const lineas = [
    resumen.esperando_respuesta > 0 && {
      clave: "respuesta",
      marca: <Semaforo luz="rojo" />,
      texto: `${plural(resumen.esperando_respuesta, "cliente no ha", "clientes no han")} respondido el precio`,
    },
    resumen.listos > 0 && {
      clave: "listos",
      marca: <Semaforo luz="verde" />,
      texto: `${plural(resumen.listos, "carro listo", "carros listos")} para recoger`,
    },
    resumen.en_taller > 0 && {
      clave: "taller",
      marca: <Semaforo luz="amarillo" />,
      texto: `${plural(resumen.en_taller, "carro", "carros")} en el taller`,
    },
    resumen.citas > 0 && {
      clave: "citas",
      marca: (
        <span className="grid h-[1.125rem] w-[3.125rem] place-items-center rounded-full bg-tinta text-white">
          <CalendarDays aria-hidden="true" size={14} strokeWidth={2.6} />
        </span>
      ),
      texto:
        `${plural(resumen.citas, "cita", "citas")}` +
        (resumen.citas_hoy > 0 ? `: ${resumen.citas_hoy} para hoy` : ", ninguna para hoy"),
    },
  ].filter(Boolean);

  return (
    <section
      aria-label="Para hoy"
      className="animar-entrada mt-8 flex flex-col gap-3 border-t border-linea pt-6"
      style={{ "--retraso": "420ms" }}
    >
      <p className="etiqueta">Para hoy</p>
      {lineas.length === 0 ? (
        <p className="text-lg text-gris">Todo tranquilo por ahora: no hay carros en el taller ni citas.</p>
      ) : (
        lineas.map(({ clave, marca, texto }, i) => (
          <p
            key={clave}
            style={{ "--retraso": `${480 + i * 70}ms` }}
            className="animar-entrada flex items-center gap-3 text-lg"
          >
            {marca}
            {texto}
          </p>
        ))
      )}
      {lineas.length > 0 && (
        <Link to="/trabajos" className="self-start py-2 text-lg font-bold text-rojo underline-offset-4 hover:underline">
          Ver los carros en el taller
        </Link>
      )}
    </section>
  );
}
