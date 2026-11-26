import { useState } from "react";
import Encabezado from "../components/layout/Encabezado";
import Pestanas from "../components/ui/Pestanas";
import ListaBitacora from "../components/bitacora/ListaBitacora";

// "Bitácora de cambios": todo lo que se ha creado, cambiado o borrado en el
// sistema, quién y cuándo, con lo de antes y lo de después. Se llena sola.

const FILTROS = [
  { valor: "todo", texto: "📚 Todo", tablas: null },
  // Las fotos y videos son de un trabajo (de cómo llegó o de cada etapa).
  { valor: "trabajos", texto: "🚦 Trabajos y fotos", tablas: ["ordenes", "orden_fotos"] },
  { valor: "precios", texto: "💲 Precios", tablas: ["orden_items"] },
  { valor: "pagos", texto: "💰 Pagos", tablas: ["pagos"] },
  { valor: "clientes", texto: "👤 Clientes y carros", tablas: ["clientes", "vehiculos"] },
];

export default function Bitacora() {
  const [filtro, setFiltro] = useState("todo");
  const elegido = FILTROS.find((f) => f.valor === filtro);

  return (
    <>
      <Encabezado titulo="Bitácora de cambios">
        Todo lo que se ha anotado, cambiado o borrado: quién lo hizo, cuándo y qué había antes. Se llena sola.
      </Encabezado>

      <div className="flex flex-col gap-8">
        <Pestanas
          etiqueta="Qué cambios ver"
          grande
          opciones={FILTROS.map(({ valor, texto }) => ({ valor, texto, cantidad: null }))}
          valor={filtro}
          alCambiar={setFiltro}
        />
        <ListaBitacora key={filtro} tablas={elegido.tablas} />
      </div>
    </>
  );
}
