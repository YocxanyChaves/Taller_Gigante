import { useCallback, useEffect, useState } from "react";
import { Car, RotateCw } from "lucide-react";
import { listarTrabajosActivos } from "../services/trabajos";
import { ESTADOS } from "../lib/estados";
import { mensajeError } from "../lib/errores";
import useRefrescar from "../lib/useRefrescar";
import Encabezado from "../components/layout/Encabezado";
import Pestanas from "../components/ui/Pestanas";
import Semaforo from "../components/ui/Semaforo";
import Aviso from "../components/ui/Aviso";
import Boton from "../components/ui/Boton";
import Vacio from "../components/ui/Vacio";
import FilaTrabajo from "../components/trabajos/FilaTrabajo";

// "Carros en el taller": todos los trabajos sin terminar, filtrados por el
// color del semáforo.

const FILTROS = [
  { valor: "todos", texto: "Todos", cumple: () => true },
  { valor: "verde", texto: "Listos", cumple: (t) => ESTADOS[t.estado]?.luz === "verde" },
  { valor: "amarillo", texto: "En trabajo", cumple: (t) => ESTADOS[t.estado]?.luz === "amarillo" },
  { valor: "rojo", texto: "Esperando", cumple: (t) => ESTADOS[t.estado]?.luz === "rojo" },
  { valor: "cita", texto: "Citas", cumple: (t) => t.estado === "cita" },
];

// La luz del semaforito de cada filtro (el mismo de las tarjetas).
const LUZ = { todos: "todas", verde: "verde", amarillo: "amarillo", rojo: "rojo", cita: null };

const VACIOS = {
  todos: "Todavía no hay carros en el taller. Toque «Agregar un carro al sistema» para anotar el primero.",
  verde: "Ningún carro está listo para recoger.",
  amarillo: "No hay carros en revisión ni en reparación.",
  rojo: "Ningún carro está esperando respuesta ni repuestos.",
  cita: "No hay citas anotadas.",
};

export default function Trabajos() {
  const [trabajos, setTrabajos] = useState(null);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const cargar = useCallback(() => {
    listarTrabajosActivos()
      .then((lista) => {
        setTrabajos(lista);
        setError("");
      })
      .catch((e) => setError(mensajeError(e)));
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Las respuestas de los clientes (desde su link) aparecen solas.
  useRefrescar(cargar, 60000);

  const opciones = FILTROS.map(({ valor, texto, cumple }) => ({
    valor,
    texto,
    cantidad: trabajos?.filter(cumple).length ?? 0,
    marca: <Semaforo luz={LUZ[valor]} grande />,
  }));
  const visibles = trabajos?.filter(FILTROS.find((f) => f.valor === filtro).cumple) ?? [];

  return (
    <>
      <Encabezado titulo="Carros en el taller">
        Toque un carro para ver en qué va y hacer el siguiente paso.
      </Encabezado>

      {error && (
        <Aviso
          tipo="alerta"
          titulo="No se pudieron cargar los carros"
          accion={
            <Boton variante="secundario" icono={RotateCw} onClick={cargar}>
              Intentar de nuevo
            </Boton>
          }
        >
          {error}
        </Aviso>
      )}

      {!error && trabajos === null && <FilasCargando />}

      {trabajos && (
        <div className="flex flex-col gap-6">
          <Pestanas etiqueta="Filtrar por estado" opciones={opciones} valor={filtro} alCambiar={setFiltro} />

          {visibles.length === 0 ? (
            <Vacio icono={Car} titulo="Nada por aquí">
              {VACIOS[filtro]}
            </Vacio>
          ) : (
            <div key={filtro} className="flex flex-col gap-6">
              {visibles.map((t, i) => (
                <FilaTrabajo key={t.id} trabajo={t} retraso={Math.min(i, 8) * 45} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Mientras carga: tarjetas grises que laten.
function FilasCargando() {
  return (
    <div aria-label="Cargando los carros" className="flex flex-col gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex h-52 animate-pulse flex-col gap-4 rounded-tarjeta border-2 border-linea bg-tarjeta p-8">
          <span className="h-9 w-28 rounded-md bg-suave" />
          <span className="h-6 w-2/3 rounded bg-suave" />
          <span className="h-5 w-full rounded bg-suave" />
          <span className="mt-auto h-5 w-1/2 rounded bg-suave" />
        </div>
      ))}
    </div>
  );
}
