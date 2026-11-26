import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, RotateCw, ScrollText } from "lucide-react";
import { listarBitacora, POR_PAGINA } from "../../services/bitacora";
import { detallesBitacora, fraseBitacora, mostrarDetalles } from "../../lib/bitacora";
import { fechaLarga } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Boton from "../ui/Boton";
import Aviso from "../ui/Aviso";
import Vacio from "../ui/Vacio";

// La lista de la bitácora, agrupada por día y lo más nuevo arriba. Cada cambio
// en su tarjeta: qué se hizo (con emoji), de qué carro o cliente, quién y a qué
// hora, y lo que cambió (antes → después). Con «Ver más» trae los anteriores.
// `tablas`/`ordenId` filtran; `enlaces` pone el botón para ir al trabajo o
// al cliente (no hace falta dentro de la ficha del mismo trabajo).

const hora = (iso) => new Date(iso).toLocaleTimeString("es-CR", { hour: "numeric", minute: "2-digit" });

function diaDe(iso) {
  const d = new Date(iso);
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);
  if (d.toDateString() === hoy.toDateString()) return "Hoy";
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  return fechaLarga(iso);
}

export default function ListaBitacora({ tablas = null, ordenId = null, enlaces = true }) {
  const [renglones, setRenglones] = useState(null);
  const [pagina, setPagina] = useState(0);
  const [hayMas, setHayMas] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // tablas viene como arreglo nuevo en cada render: se compara por su texto.
  const claveTablas = tablas?.join(",") ?? "";

  const traer = useCallback(
    (p) =>
      listarBitacora({ tablas: claveTablas ? claveTablas.split(",") : null, ordenId, pagina: p })
        .then((datos) => {
          setRenglones((antes) => (p === 0 ? datos : [...(antes ?? []), ...datos]));
          setHayMas(datos.length === POR_PAGINA);
          setPagina(p);
          setError("");
        })
        .catch((e) => setError(mensajeError(e)))
        .finally(() => setCargando(false)),
    [claveTablas, ordenId]
  );

  const cargar = (p) => {
    setCargando(true);
    traer(p);
  };

  useEffect(() => {
    traer(0);
  }, [traer]);

  if (error && !renglones) {
    return (
      <Aviso
        tipo="alerta"
        titulo="No se pudo cargar la bitácora"
        accion={
          <Boton variante="secundario" icono={RotateCw} onClick={() => cargar(0)}>
            Intentar de nuevo
          </Boton>
        }
      >
        {error}
      </Aviso>
    );
  }

  if (!renglones) return <p className="animate-pulse p-6 text-xl text-gris">Cargando los cambios…</p>;

  if (renglones.length === 0) {
    return (
      <Vacio icono={ScrollText} titulo="Todavía no hay cambios anotados">
        Aquí van a ir apareciendo solos los cambios que se hagan desde ahora.
      </Vacio>
    );
  }

  // Agrupar por día, en orden.
  const dias = [];
  for (const r of renglones) {
    const dia = diaDe(r.creado_en);
    if (dias.at(-1)?.dia !== dia) dias.push({ dia, renglones: [] });
    dias.at(-1).renglones.push(r);
  }

  return (
    <div className="flex flex-col gap-8">
      {dias.map(({ dia, renglones: delDia }) => (
        <section key={dia} className="flex flex-col gap-4">
          <h3 className="etiqueta first-letter:uppercase">{dia}</h3>
          <ol className="flex flex-col gap-4">
            {delDia.map((r, i) => (
              <li key={r.id} className="animar-entrada" style={{ "--retraso": `${Math.min(i, 8) * 40}ms` }}>
                <Renglon renglon={r} enlaces={enlaces} />
              </li>
            ))}
          </ol>
        </section>
      ))}

      {error && <p role="alert" className="text-lg font-bold text-rojo">{error}</p>}
      {hayMas && (
        <Boton variante="secundario" anchoCompleto onClick={() => cargar(pagina + 1)} disabled={cargando}>
          {cargando ? "Cargando…" : "Ver cambios más viejos"}
        </Boton>
      )}
    </div>
  );
}

function Renglon({ renglon: r, enlaces }) {
  const { emoji, texto } = fraseBitacora(r);
  const detalles = mostrarDetalles(r) ? detallesBitacora(r) : [];
  const destino = r.orden_id && r.accion !== "borrar" ? `/trabajos/${r.orden_id}` : r.cliente_id ? `/clientes/${r.cliente_id}` : null;
  const borrado = r.accion === "borrar";

  return (
    <article
      className={
        "seccion-viva flex flex-col gap-4 rounded-tarjeta border-2 bg-tarjeta p-5 sm:flex-row sm:p-6 " +
        (borrado ? "border-rojo/30 hover:border-rojo" : "border-linea hover:border-rojo")
      }
    >
      <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-full bg-suave text-2xl">
        {emoji}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-xl font-bold break-words">{texto}</p>
        {r.que && <p className="text-lg break-words">{r.que}</p>}
        <p className="text-base text-gris">
          {r.quien} · {hora(r.creado_en)}
        </p>

        {detalles.length > 0 && (
          <dl className="mt-2 flex flex-col gap-2 rounded-control bg-fondo p-4">
            {detalles.map((d) => (
              <div key={d.etiqueta} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="shrink-0 font-bold sm:w-56">{d.etiqueta}</dt>
                <dd className="min-w-0 text-lg break-words">
                  {d.antes !== undefined && d.despues !== undefined ? (
                    <>
                      <span className="text-gris line-through decoration-rojo/50">{d.antes}</span>
                      <span aria-label="cambió a" className="mx-2 font-bold text-rojo">
                        →
                      </span>
                      <span className="font-bold">{d.despues}</span>
                    </>
                  ) : (
                    <span className={d.despues === undefined ? "text-gris" : ""}>{d.despues ?? d.antes}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {enlaces && destino && (
        <Link
          to={destino}
          className="group flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-control border-2 border-linea-fuerte px-4 text-lg font-bold transition-colors hover:border-rojo hover:bg-rojo hover:text-white"
        >
          {r.orden_id ? "Ver el trabajo" : "Ver el cliente"}
          <ArrowRight aria-hidden="true" size={20} className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </article>
  );
}
