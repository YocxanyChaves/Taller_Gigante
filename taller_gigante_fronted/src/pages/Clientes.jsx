import { useSearchParams } from "react-router-dom";
import { Car, SearchX, Users } from "lucide-react";
import { buscarClientes } from "../services/clientes";
import useBusqueda from "../lib/useBusqueda";
import Encabezado from "../components/layout/Encabezado";
import Campo from "../components/ui/Campo";
import Aviso from "../components/ui/Aviso";
import Boton from "../components/ui/Boton";
import Vacio from "../components/ui/Vacio";
import FilaCliente from "../components/clientes/FilaCliente";

// "Buscar un cliente": un solo campo para nombre, teléfono o placa, que busca
// mientras se escribe. Sin texto muestra los últimos clientes. Lo escrito queda
// en la dirección (?q=), así al volver de la ficha sigue ahí.

export default function Clientes() {
  const [parametros, setParametros] = useSearchParams();
  const texto = parametros.get("q") ?? "";
  const clave = texto.trim();
  const busqueda = useBusqueda(clave, buscarClientes, 300);
  const clientes = busqueda.resultado ?? [];

  const cambiar = (e) => {
    const valor = e.target.value;
    setParametros(valor ? { q: valor } : {}, { replace: true });
  };

  return (
    <>
      <Encabezado titulo="Buscar un cliente">
        Escriba el nombre, el teléfono o la placa. Toque al cliente para ver sus carros y lo que debe.
      </Encabezado>

      <Campo
        etiqueta="Nombre, teléfono o placa"
        type="search"
        autoFocus
        autoComplete="off"
        placeholder="Carlos, 8888 1111 o BTR-482"
        value={texto}
        onChange={cambiar}
        className="mb-6 max-w-2xl"
      />

      {busqueda.estado === "buscando" && <FilasCargando />}

      {busqueda.estado === "error" && (
        <Aviso tipo="alerta" titulo="No se pudo buscar">
          Revise el internet e intente de nuevo.
        </Aviso>
      )}

      {busqueda.estado === "listo" && clientes.length === 0 && (
        clave ? (
          <Vacio
            icono={SearchX}
            titulo="No encontramos a nadie"
            accion={
              <Boton variante="secundario" icono={Car} to="/trabajos/nuevo">
                Recibir un carro
              </Boton>
            }
          >
            Revise cómo lo escribió o pruebe con otro dato. Si es un cliente nuevo, se anota al recibir su carro.
          </Vacio>
        ) : (
          <Vacio icono={Users} titulo="Todavía no hay clientes">
            Los clientes se anotan solos al recibir su primer carro.
          </Vacio>
        )
      )}

      {busqueda.estado === "listo" && clientes.length > 0 && (
        <section>
          <h2 className="etiqueta mb-3">
            {clave
              ? clientes.length === 1
                ? "1 cliente encontrado"
                : `${clientes.length} clientes encontrados`
              : "Últimos clientes"}
          </h2>
          <div className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
            {clientes.map((c, i) => (
              <FilaCliente key={c.id} cliente={c} retraso={Math.min(i, 8) * 45} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

// Mientras busca: filas grises que laten.
function FilasCargando() {
  return (
    <div aria-label="Buscando clientes" className="overflow-hidden rounded-tarjeta border border-linea bg-tarjeta">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex animate-pulse items-center gap-6 border-b border-linea px-6 py-5 last:border-b-0">
          <span className="flex w-64 flex-col gap-2">
            <span className="h-5 w-3/4 rounded bg-suave" />
            <span className="h-4 w-1/2 rounded bg-suave" />
          </span>
          <span className="h-9 w-28 rounded-md bg-suave" />
        </div>
      ))}
    </div>
  );
}
