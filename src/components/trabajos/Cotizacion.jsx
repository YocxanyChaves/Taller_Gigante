import { useRef, useState } from "react";
import { Check, Cog, ListChecks, Pencil, Plus, Receipt, Trash2, Wrench } from "lucide-react";
import { guardarCotizacion } from "../../services/trabajos";
import { formatoColones, soloDigitos } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";

// El precio del trabajo: diagnóstico y lo que se cobra, en tres áreas fijas,
// cada una con su color: Repuestos (azul), Mano de obra (amarillo) y Otros
// cobros (verde). Se ve como lista; con "Cambiar el precio" se arma como una
// lista de compras: a la izquierda, una plantilla por área (qué es, precio…)
// con su botón «Agregar», que se va pintando conforme se llenan los datos y
// queda pintado del todo cuando ya se puede agregar. A la derecha, la lista de
// cobros, ordenada por área, que es lo mismo que ve el cliente en su link.
// "Me costó" es opcional y solo en repuestos: sirve para la ganancia y el
// cliente nunca lo ve.

const SECCIONES = [
  {
    tipo: "repuesto",
    titulo: "Repuestos",
    una: "repuesto",
    icono: Cog,
    ejemplo: "Pastillas de freno",
    color: {
      borde: "border-l-azul",
      fondo: "bg-azul/8",
      texto: "text-azul",
      circulo: "bg-azul text-white",
      boton: "border-azul text-azul",
      relleno: "bg-azul",
      rellenoSuave: "bg-azul/20",
    },
  },
  {
    tipo: "mano_obra",
    titulo: "Mano de obra",
    una: "mano de obra",
    icono: Wrench,
    ejemplo: "Cambio de pastillas",
    color: {
      borde: "border-l-amarillo",
      fondo: "bg-amarillo/12",
      texto: "text-amarillo-texto",
      circulo: "bg-amarillo text-tinta",
      boton: "border-amarillo text-amarillo-texto",
      relleno: "bg-amarillo",
      rellenoSuave: "bg-amarillo/30",
    },
  },
  {
    tipo: "otro",
    titulo: "Otros cobros",
    una: "otro cobro",
    icono: Receipt,
    ejemplo: "Revisión, lavado, grúa…",
    color: {
      borde: "border-l-verde",
      fondo: "bg-verde/8",
      texto: "text-verde-texto",
      circulo: "bg-verde text-white",
      boton: "border-verde text-verde-texto",
      relleno: "bg-verde",
      rellenoSuave: "bg-verde/20",
    },
  },
];

const aNumero = (texto) => (soloDigitos(texto) === "" ? null : Number(soloDigitos(texto)));
const aCantidad = (texto) => Number(String(texto).replace(",", "."));

// De las filas de la base a filas de la lista (texto en los campos).
const aEditable = (item) => ({
  clave: `i${item.id}`,
  id: item.id,
  tipo: item.tipo,
  descripcion: item.descripcion,
  cantidad: String(Number(item.cantidad)),
  precio: String(Number(item.precio_unitario)),
  costo: item.costo_unitario == null ? "" : String(Number(item.costo_unitario)),
});

let siguienteClave = 0;
const plantillaVacia = (tipo) => ({ clave: null, id: null, tipo, descripcion: "", cantidad: "1", precio: "", costo: "" });

function subtotal(fila) {
  const cantidad = aCantidad(fila.cantidad);
  const precio = aNumero(fila.precio);
  return cantidad > 0 && precio != null ? cantidad * precio : 0;
}

// Lo que pide cada plantilla para poder agregarla, y qué falta.
function requisitos(fila) {
  const lista = [{ texto: "qué es", listo: fila.descripcion.trim() !== "" }];
  if (fila.tipo === "repuesto" || fila.cantidad !== "1") {
    lista.push({ texto: "cantidad", listo: aCantidad(fila.cantidad) > 0 });
  }
  lista.push({ texto: "precio", listo: aNumero(fila.precio) != null });
  return lista;
}

const enBlanco = (fila) => !fila.descripcion.trim() && aNumero(fila.precio) == null && !fila.costo;
const completa = (fila) => requisitos(fila).every((r) => r.listo);

export default function Cotizacion({ trabajo, editando, alEditar, alGuardado }) {
  const editable = !["entregado", "cancelado"].includes(trabajo.estado);

  if (editando) {
    return <EditorCotizacion trabajo={trabajo} alCancelar={() => alEditar(false)} alGuardado={alGuardado} />;
  }

  const total = trabajo.items.reduce((suma, i) => suma + Number(i.subtotal), 0);

  return (
    <section className="rounded-tarjeta border border-linea bg-tarjeta shadow-tarjeta">
      <h2 className="border-b border-linea px-6 py-4 text-xl font-bold">Diagnóstico y precio</h2>
      <div className="p-6">
        {trabajo.items.length === 0 && !trabajo.diagnostico ? (
          <p className="text-lg text-gris">Todavía no se ha anotado el diagnóstico ni el precio.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {trabajo.diagnostico && (
              <div>
                <p className="text-base text-gris">Qué tiene el carro</p>
                <p className="mt-1 text-lg whitespace-pre-line">{trabajo.diagnostico}</p>
              </div>
            )}
            {trabajo.items.length > 0 && (
              <div className={trabajo.diagnostico ? "" : "lg:col-span-2"}>
                <ListaCobros filas={trabajo.items.map(aEditable)} />
                <Total monto={total} />
              </div>
            )}
            {trabajo.aprobada === false && (
              <p className="text-base text-gris lg:col-span-2">
                El cliente no aprobó el trabajo: solo se cobra la revisión, si se cobra.
              </p>
            )}
          </div>
        )}

        {editable && (trabajo.items.length > 0 || trabajo.diagnostico) && (
          <Boton variante="secundario" icono={Pencil} className="mt-6" onClick={() => alEditar(true)}>
            Cambiar el precio
          </Boton>
        )}
      </div>
    </section>
  );
}

function Total({ monto, grande = false }) {
  return (
    <div className="mt-5 flex items-baseline justify-between border-t-2 border-tinta pt-4">
      <p className={`${grande ? "text-2xl" : "text-xl"} font-bold`}>Total</p>
      <p className={`numeros ${grande ? "text-4xl" : "text-3xl"} font-bold`}>{formatoColones(monto)}</p>
    </div>
  );
}

// Encabezado de un área: círculo de color con su ícono, el nombre y el subtotal.
function EncabezadoArea({ seccion, monto }) {
  const { titulo, icono: Icono, color } = seccion;
  return (
    <header className={`flex items-center justify-between gap-3 px-4 py-3 ${color.fondo}`}>
      <h3 className={`flex items-center gap-3 text-lg font-bold uppercase tracking-wide ${color.texto}`}>
        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${color.circulo}`}>
          <Icono aria-hidden="true" size={20} />
        </span>
        {titulo}
      </h3>
      {monto != null && <p className={`numeros text-lg font-bold ${color.texto}`}>{formatoColones(monto)}</p>}
    </header>
  );
}

// La lista de cobros, por área. Con `alCambiar`/`alQuitar` cada renglón trae
// sus botones (en el editor); sin ellos es solo para ver.
function ListaCobros({ filas, alCambiar, alQuitar, nueva }) {
  return (
    <div className="flex flex-col gap-4">
      {SECCIONES.map((seccion) => {
        const delArea = filas.filter((f) => f.tipo === seccion.tipo);
        if (!delArea.length) return null;
        return (
          <section
            key={seccion.tipo}
            className={`overflow-hidden rounded-tarjeta border border-linea border-l-[6px] bg-tarjeta ${seccion.color.borde}`}
          >
            <EncabezadoArea seccion={seccion} monto={delArea.reduce((suma, f) => suma + subtotal(f), 0)} />
            <ol className="divide-y divide-linea px-4">
              {delArea.map((fila, i) => (
                <li
                  key={fila.clave}
                  className={`flex items-start gap-3 py-3 ${fila.clave === nueva ? "destello" : ""}`}
                >
                  <span className={`numeros w-6 shrink-0 pt-0.5 text-lg font-bold ${seccion.color.texto}`}>{i + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold break-words">{fila.descripcion}</p>
                    {(aCantidad(fila.cantidad) !== 1 || (fila.tipo === "repuesto" && fila.costo !== "")) && (
                      <p className="text-base text-gris">
                        {aCantidad(fila.cantidad) !== 1 &&
                          `${aCantidad(fila.cantidad)} × ${formatoColones(aNumero(fila.precio) ?? 0)}`}
                        {aCantidad(fila.cantidad) !== 1 && fila.tipo === "repuesto" && fila.costo !== "" && " · "}
                        {fila.tipo === "repuesto" && fila.costo !== "" && `le costó ${formatoColones(aNumero(fila.costo))}`}
                      </p>
                    )}
                    {alCambiar && (
                      <div className="mt-1 flex flex-wrap gap-x-4">
                        <button
                          type="button"
                          onClick={() => alCambiar(fila)}
                          className="flex min-h-11 items-center gap-1.5 text-base font-bold text-gris underline-offset-4 hover:text-tinta hover:underline"
                        >
                          <Pencil aria-hidden="true" size={16} />
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={() => alQuitar(fila)}
                          className="flex min-h-11 items-center gap-1.5 text-base font-bold text-gris underline-offset-4 hover:text-rojo hover:underline"
                        >
                          <Trash2 aria-hidden="true" size={16} />
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="numeros shrink-0 text-lg font-bold">{formatoColones(subtotal(fila))}</p>
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function EditorCotizacion({ trabajo, alCancelar, alGuardado }) {
  const [diagnostico, setDiagnostico] = useState(trabajo.diagnostico ?? "");
  const [lista, setLista] = useState(() => trabajo.items.map(aEditable));
  const [plantillas, setPlantillas] = useState(() =>
    Object.fromEntries(SECCIONES.map((s) => [s.tipo, plantillaVacia(s.tipo)]))
  );
  const [nueva, setNueva] = useState(null); // el último renglón agregado, para el destello
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const primerCampo = useRef({});

  const total = lista.reduce((suma, f) => suma + subtotal(f), 0);

  const cambiarPlantilla = (tipo, campo, valor) =>
    setPlantillas((ps) => ({ ...ps, [tipo]: { ...ps[tipo], [campo]: valor } }));

  // Pasa la plantilla a la lista (si se estaba cambiando un renglón, vuelve a
  // su mismo lugar) y la deja en blanco para el siguiente.
  const agregar = (tipo) => {
    const fila = plantillas[tipo];
    const clave = fila.clave ?? `n${siguienteClave++}`;
    const lista_ = { ...fila, clave };
    setLista((l) => (l.some((f) => f.clave === clave) ? l.map((f) => (f.clave === clave ? lista_ : f)) : [...l, lista_]));
    setPlantillas((ps) => ({ ...ps, [tipo]: plantillaVacia(tipo) }));
    setNueva(clave);
    setError("");
    primerCampo.current[tipo]?.focus();
  };

  // «Cambiar» un renglón: se sube a su plantilla para corregirlo. Mientras
  // tanto queda en la lista, marcado como "cambiando".
  const cambiar = (fila) => {
    setPlantillas((ps) => ({ ...ps, [fila.tipo]: { ...fila } }));
    primerCampo.current[fila.tipo]?.focus();
    primerCampo.current[fila.tipo]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const quitar = (fila) => {
    setLista((l) => l.filter((f) => f.clave !== fila.clave));
    setPlantillas((ps) => (ps[fila.tipo].clave === fila.clave ? { ...ps, [fila.tipo]: plantillaVacia(fila.tipo) } : ps));
  };

  const guardar = async () => {
    // Lo que quedó completo en una plantilla sin tocar «Agregar» también va.
    let final = lista;
    for (const s of SECCIONES) {
      const p = plantillas[s.tipo];
      if (enBlanco(p)) continue;
      if (!completa(p)) {
        setError(`En «${s.titulo}» quedó algo a medio escribir: termínelo y tóquele «Agregar», o bórrelo.`);
        return;
      }
      const clave = p.clave ?? `n${siguienteClave++}`;
      final = final.some((f) => f.clave === clave)
        ? final.map((f) => (f.clave === clave ? { ...p, clave } : f))
        : [...final, { ...p, clave }];
    }
    if (final.length === 0) {
      setError("Agregue al menos un cobro a la lista.");
      return;
    }

    setGuardando(true);
    setError("");
    try {
      await guardarCotizacion(
        trabajo.id,
        diagnostico,
        final.map((f) => ({
          id: f.id,
          tipo: f.tipo,
          descripcion: f.descripcion.trim(),
          cantidad: aCantidad(f.cantidad),
          precio: aNumero(f.precio),
          costo: aNumero(f.costo),
        })),
        trabajo.items
      );
      await alGuardado();
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  };

  return (
    <section className="aparecer rounded-tarjeta border-2 border-tinta bg-tarjeta shadow-elevada">
      <h2 className="border-b border-linea px-6 py-4 text-xl font-bold">Diagnóstico y precio</h2>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Campo
          etiqueta="Qué tiene el carro"
          multilinea
          autoFocus
          placeholder="Por ejemplo: pastillas delanteras gastadas y discos rayados."
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />

        <div className="grid items-start gap-6 lg:grid-cols-2">
          {/* Izquierda: una plantilla por área. */}
          <div className="flex flex-col gap-5">
            <p className="text-lg font-bold">Anote lo que se cobra</p>
            {SECCIONES.map((seccion) => (
              <Plantilla
                key={seccion.tipo}
                seccion={seccion}
                fila={plantillas[seccion.tipo]}
                cambiando={lista.some((f) => f.clave === plantillas[seccion.tipo].clave)}
                refPrimerCampo={(el) => (primerCampo.current[seccion.tipo] = el)}
                alCambiar={(campo, valor) => cambiarPlantilla(seccion.tipo, campo, valor)}
                alAgregar={() => agregar(seccion.tipo)}
                alDescartar={() => setPlantillas((ps) => ({ ...ps, [seccion.tipo]: plantillaVacia(seccion.tipo) }))}
              />
            ))}
          </div>

          {/* Derecha: la lista de cobros, como la ve el cliente. */}
          <div className="flex flex-col gap-3 lg:sticky lg:top-24">
            <div>
              <p className="flex items-center gap-2 text-lg font-bold">
                <ListChecks aria-hidden="true" size={22} />
                Lista de cobros
              </p>
              <p className="text-base text-gris">Así la va a ver el cliente en su link.</p>
            </div>
            <div className="rounded-tarjeta border-2 border-dashed border-linea-fuerte bg-fondo p-3 sm:p-4">
              {lista.length === 0 ? (
                <p className="px-2 py-8 text-center text-lg text-gris">
                  Todavía está vacía. Llene una plantilla de la izquierda y tóquele «Agregar».
                </p>
              ) : (
                <>
                  <ListaCobros filas={lista} alCambiar={cambiar} alQuitar={quitar} nueva={nueva} />
                  <Total monto={total} grande />
                </>
              )}
            </div>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-control border-2 border-rojo/30 bg-rojo/5 p-4 text-lg font-bold text-rojo">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Boton variante="gris" onClick={alCancelar} disabled={guardando}>
            Cancelar
          </Boton>
          <Boton onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar el precio"}
          </Boton>
        </div>
      </div>
    </section>
  );
}

// La plantilla de un área: los campos y el botón «Agregar», que se va
// llenando de color con cada dato que se completa. Con Enter también agrega.
function Plantilla({ seccion, fila, cambiando, refPrimerCampo, alCambiar, alAgregar, alDescartar }) {
  const { color } = seccion;
  const reqs = requisitos(fila);
  const hechos = reqs.filter((r) => r.listo).length;
  const lista = hechos === reqs.length;
  const faltan = reqs.filter((r) => !r.listo).map((r) => r.texto);
  const [intento, setIntento] = useState(false);
  const mostrarCantidad = fila.tipo === "repuesto" || fila.cantidad !== "1";

  const enviar = (e) => {
    e.preventDefault();
    if (!lista) {
      setIntento(true);
      return;
    }
    setIntento(false);
    alAgregar();
  };

  return (
    <form
      onSubmit={enviar}
      aria-label={seccion.titulo}
      className={`overflow-hidden rounded-tarjeta border border-linea border-l-[6px] ${color.borde}`}
    >
      <EncabezadoArea seccion={seccion} />
      <div className="flex flex-col gap-4 p-4">
        {cambiando && <p className="text-base font-bold text-gris">Cambiando un renglón de la lista.</p>}
        <div className={`grid gap-4 ${mostrarCantidad ? "sm:grid-cols-[minmax(0,1fr)_6rem]" : ""}`}>
          <Campo
            ref={refPrimerCampo}
            etiqueta="Qué es"
            placeholder={seccion.ejemplo}
            value={fila.descripcion}
            onChange={(e) => alCambiar("descripcion", e.target.value)}
          />
          {mostrarCantidad && (
            <Campo
              etiqueta="Cantidad"
              inputMode="decimal"
              value={fila.cantidad}
              onChange={(e) => alCambiar("cantidad", e.target.value)}
            />
          )}
        </div>
        <div className={`grid gap-4 ${fila.tipo === "repuesto" ? "sm:grid-cols-2" : ""}`}>
          <Campo
            etiqueta="Precio al cliente (₡)"
            inputMode="numeric"
            placeholder="15000"
            value={fila.precio}
            onChange={(e) => alCambiar("precio", e.target.value)}
          />
          {fila.tipo === "repuesto" && (
            <Campo
              etiqueta="Me costó (₡)"
              opcional
              inputMode="numeric"
              ayuda="El cliente no lo ve."
              value={fila.costo}
              onChange={(e) => alCambiar("costo", e.target.value)}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            aria-disabled={!lista}
            className={
              "group relative flex min-h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-control border-2 px-5 text-lg font-bold transition-[color,box-shadow,translate] duration-200 sm:flex-none " +
              color.boton +
              (lista ? " text-white! shadow-elevada hover:-translate-y-0.5 active:translate-y-0" : " cursor-default")
            }
          >
            <span
              aria-hidden="true"
              className={`relleno-progreso absolute inset-y-0 left-0 ${lista ? color.relleno : color.rellenoSuave}`}
              style={{ width: `${(hechos / reqs.length) * 100}%` }}
            />
            <span className="relative flex items-center gap-2">
              {lista ? <Check aria-hidden="true" size={22} strokeWidth={3} /> : <Plus aria-hidden="true" size={22} />}
              {cambiando ? "Guardar el cambio" : lista ? "Agregar a la lista" : `Agregar ${seccion.una}`}
            </span>
          </button>
          {!enBlanco(fila) && (
            <Boton variante="gris" onClick={alDescartar} className="min-h-12 px-3">
              Borrar
            </Boton>
          )}
        </div>
        {!lista && (intento || !enBlanco(fila)) && (
          <p role={intento ? "alert" : undefined} className={`text-base ${intento ? "font-bold text-rojo" : "text-gris"}`}>
            Falta: {faltan.join(", ")}.
          </p>
        )}
        {lista && fila.tipo === "repuesto" && aCantidad(fila.cantidad) !== 1 && (
          <p className="numeros text-base text-gris">
            Subtotal: <strong className="text-tinta">{formatoColones(subtotal(fila))}</strong>
          </p>
        )}
      </div>
    </form>
  );
}
