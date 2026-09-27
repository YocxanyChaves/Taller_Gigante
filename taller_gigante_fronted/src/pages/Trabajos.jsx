import { useCallback, useEffect, useState } from "react";
import { Car, RotateCw } from "lucide-react";
import { listarTrabajosActivos } from "../services/trabajos";
import { ESTADOS } from "../lib/estados";
import { mensajeError } from "../lib/errores";
import Encabezado from "../components/layout/Encabezado";
import Pestanas from "../components/ui/Pestanas";
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

const PUNTO = {
  verde: "bg-verde",
  amarillo: "bg-amarillo",
  rojo: "bg-semaforo-rojo",
};

const VACIOS = {
  todos: "Todavía no hay carros en el taller. Toque «Recibir un carro» para anotar el primero.",
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

  const opciones = FILTROS.map(({ valor, texto, cumple }) => ({
    valor,
    texto,
    cantidad: trabajos?.filter(cumple).length ?? 0,
    marca: PUNTO[valor] ? <span aria-hidden="true" className={`size-3 rounded-full ${PUNTO[valor]}`} /> : null,
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
            <div key={filtro} className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
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

// Mientras carga: filas grises que laten.
function FilasCargando() {
  return (
    <div aria-label="Cargando los carros" className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-6 border-b border-linea px-6 py-5 last:border-b-0">
          <span className="h-9 w-28 rounded-md bg-suave" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="h-5 w-2/3 rounded bg-suave" />
            <span className="h-4 w-1/3 rounded bg-suave" />
          </span>
        </div>
      ))}
    </div>
  );
}
