import { useState } from "react";
import { Cog, Pencil, Plus, Receipt, Trash2, Wrench } from "lucide-react";
import { guardarCotizacion } from "../../services/trabajos";
import { formatoColones, soloDigitos } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";

// El precio del trabajo: diagnóstico y lo que se cobra, en tres áreas fijas,
// una debajo de la otra y cada una con su color: Repuestos (azul), Mano de
// obra (naranja) y Otros (gris). Cada área tiene sus filas y su botón para
// agregar otra; una fila no se puede pasar de un área a otra. Se ve como
// lista; con "Cambiar el precio" se edita con el total en vivo.
// "Me costó" es opcional y solo en repuestos: sirve para la ganancia y el
// cliente nunca lo ve.

const SECCIONES = [
  {
    tipo: "repuesto",
    titulo: "Repuestos",
    una: "repuesto",
    icono: Cog,
    ejemplo: "Pastillas de freno",
    vacio: "No lleva repuestos.",
    color: { borde: "border-l-azul", fondo: "bg-azul/8", texto: "text-azul", circulo: "bg-azul", boton: "border-azul text-azul hover:bg-azul/8" },
  },
  {
    tipo: "mano_obra",
    titulo: "Mano de obra",
    una: "mano de obra",
    icono: Wrench,
    ejemplo: "Cambio de pastillas",
    vacio: "No se anotó mano de obra.",
    color: { borde: "border-l-naranja", fondo: "bg-naranja/8", texto: "text-naranja", circulo: "bg-naranja", boton: "border-naranja text-naranja hover:bg-naranja/8" },
  },
  {
    tipo: "otro",
    titulo: "Otros cobros",
    una: "otro cobro",
    icono: Receipt,
    ejemplo: "Revisión, lavado, grúa…",
    vacio: "No hay otros cobros.",
    color: { borde: "border-l-gris", fondo: "bg-suave", texto: "text-gris", circulo: "bg-gris", boton: "border-gris text-gris hover:bg-suave" },
  },
];

const aNumero = (texto) => (soloDigitos(texto) === "" ? null : Number(soloDigitos(texto)));
const aCantidad = (texto) => Number(String(texto).replace(",", "."));

// De las filas de la base a filas editables (texto en los campos).
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
const filaNueva = (tipo) => ({
  clave: `n${siguienteClave++}`,
  id: null,
  tipo,
  descripcion: "",
  cantidad: "1",
  precio: "",
  costo: "",
});

function subtotal(fila) {
  const cantidad = aCantidad(fila.cantidad);
  const precio = aNumero(fila.precio);
  return cantidad > 0 && precio != null ? cantidad * precio : 0;
}

// Una fila nueva que no se tocó (sin qué es ni precio) no cuenta: se ignora al guardar.
const enBlanco = (fila) => !fila.id && !fila.descripcion.trim() && aNumero(fila.precio) == null && !fila.costo;

function errorDeFila(fila) {
  if (!fila.descripcion.trim()) return "Escriba qué es.";
  if (!(aCantidad(fila.cantidad) > 0)) return "La cantidad tiene que ser mayor que 0.";
  if (aNumero(fila.precio) == null) return "Escriba el precio al cliente.";
  return null;
}

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
          <>
            {trabajo.diagnostico && (
              <>
                <p className="text-base text-gris">Qué tiene el carro</p>
                <p className="mt-1 text-lg whitespace-pre-line">{trabajo.diagnostico}</p>
              </>
            )}
            {trabajo.items.length > 0 && (
              <div className="mt-5 flex flex-col gap-4">
                {SECCIONES.map((seccion) => {
                  const items = trabajo.items.filter((i) => i.tipo === seccion.tipo);
                  if (!items.length) return null;
                  return (
                    <Area
                      key={seccion.tipo}
                      seccion={seccion}
                      subtotal={items.reduce((suma, i) => suma + Number(i.subtotal), 0)}
                    >
                      <ul className="divide-y divide-linea">
                        {items.map((item) => (
                          <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                            <div className="min-w-0">
                              <p className="text-lg font-bold break-words">{item.descripcion}</p>
                              {(Number(item.cantidad) !== 1 || (item.tipo === "repuesto" && item.costo_unitario != null)) && (
                                <p className="text-base text-gris">
                                  {Number(item.cantidad) !== 1 &&
                                    `${Number(item.cantidad)} × ${formatoColones(item.precio_unitario)}`}
                                  {Number(item.cantidad) !== 1 && item.tipo === "repuesto" && item.costo_unitario != null && " · "}
                                  {item.tipo === "repuesto" &&
                                    item.costo_unitario != null &&
                                    `le costó ${formatoColones(item.costo_unitario)}`}
                                </p>
                              )}
                            </div>
                            <p className="numeros shrink-0 text-lg font-bold">{formatoColones(item.subtotal)}</p>
                          </li>
                        ))}
                      </ul>
                    </Area>
                  );
                })}
              </div>
            )}
            {trabajo.items.length > 0 && (
              <div className="mt-5 flex items-baseline justify-between border-t-2 border-tinta pt-4">
                <p className="text-xl font-bold">Total</p>
                <p className="numeros text-3xl font-bold">{formatoColones(total)}</p>
              </div>
            )}
            {trabajo.aprobada === false && (
              <p className="mt-3 text-base text-gris">
                El cliente no aprobó el trabajo: solo se cobra la revisión, si se cobra.
              </p>
            )}
          </>
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

// Un área del precio: franja de color a la izquierda, encabezado con su ícono
// y su nombre, lo de adentro y el subtotal del área.
function Area({ seccion, subtotal: monto, children }) {
  const { titulo, icono: Icono, color } = seccion;
  return (
    <section className={`overflow-hidden rounded-tarjeta border border-linea border-l-[6px] ${color.borde}`}>
      <header className={`flex items-center justify-between gap-3 px-4 py-3 ${color.fondo}`}>
        <h3 className={`flex items-center gap-3 text-lg font-bold uppercase tracking-wide ${color.texto}`}>
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-white ${color.circulo}`}>
            <Icono aria-hidden="true" size={20} />
          </span>
          {titulo}
        </h3>
        <p className={`numeros text-lg font-bold ${color.texto}`}>{formatoColones(monto)}</p>
      </header>
      <div className="px-4">{children}</div>
    </section>
  );
}

function EditorCotizacion({ trabajo, alCancelar, alGuardado }) {
  const [diagnostico, setDiagnostico] = useState(trabajo.diagnostico ?? "");
  const [filas, setFilas] = useState(() =>
    trabajo.items.length ? trabajo.items.map(aEditable) : [filaNueva("repuesto"), filaNueva("mano_obra")]
  );
  const [intento, setIntento] = useState(false); // ya tocó "Guardar": mostrar errores
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const cambiarFila = (clave, campo, valor) =>
    setFilas((fs) => fs.map((f) => (f.clave === clave ? { ...f, [campo]: valor } : f)));
  const total = filas.reduce((suma, f) => suma + subtotal(f), 0);
  const aGuardar = filas.filter((f) => !enBlanco(f));

  const guardar = async () => {
    setIntento(true);
    if (aGuardar.length === 0 || aGuardar.some(errorDeFila)) return;
    setGuardando(true);
    setError("");
    try {
      await guardarCotizacion(
        trabajo.id,
        diagnostico,
        aGuardar.map((f) => ({
          id: f.id,
          tipo: f.tipo,
          descripcion: f.descripcion,
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

        <div className="flex flex-col gap-5">
          <p className="text-lg font-bold">Lo que se cobra</p>
          {SECCIONES.map((seccion) => {
            const delArea = filas.filter((f) => f.tipo === seccion.tipo);
            return (
              <Area key={seccion.tipo} seccion={seccion} subtotal={delArea.reduce((suma, f) => suma + subtotal(f), 0)}>
                <div className="flex flex-col gap-3 py-4">
                  {delArea.length === 0 && <p className="text-base text-gris">{seccion.vacio}</p>}
                  {delArea.map((fila, i) => (
                    <FilaEditable
                      key={fila.clave}
                      etiqueta={`${seccion.titulo}, fila ${i + 1}`}
                      ejemplo={seccion.ejemplo}
                      fila={fila}
                      error={intento && !enBlanco(fila) ? errorDeFila(fila) : null}
                      alCambiar={(campo, valor) => cambiarFila(fila.clave, campo, valor)}
                      alQuitar={() => setFilas((fs) => fs.filter((f) => f.clave !== fila.clave))}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setFilas((fs) => [...fs, filaNueva(seccion.tipo)])}
                    className={`inline-flex min-h-12 items-center gap-2 self-start rounded-control border-2 border-dashed px-4 text-lg font-bold transition-colors ${seccion.color.boton}`}
                  >
                    <Plus aria-hidden="true" size={20} />
                    Agregar {delArea.length ? "otro" : ""} {seccion.una}
                  </button>
                </div>
              </Area>
            );
          })}
          {intento && aGuardar.length === 0 && (
            <p role="alert" className="text-lg font-bold text-rojo">Anote al menos un cobro con su precio.</p>
          )}
        </div>

        <div className="flex items-baseline justify-between border-t-2 border-tinta pt-4">
          <p className="text-2xl font-bold">Total</p>
          <p className="numeros text-4xl font-bold">{formatoColones(total)}</p>
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

function FilaEditable({ etiqueta, ejemplo, fila, error, alCambiar, alQuitar }) {
  return (
    <div role="group" aria-label={etiqueta} className="animar-entrada rounded-control border border-linea bg-tarjeta p-3 sm:p-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_11rem]">
        <Campo
          etiqueta="Qué es"
          placeholder={ejemplo}
          value={fila.descripcion}
          onChange={(e) => alCambiar("descripcion", e.target.value)}
        />
        <Campo
          etiqueta="Cantidad"
          inputMode="decimal"
          value={fila.cantidad}
          onChange={(e) => alCambiar("cantidad", e.target.value)}
        />
        <Campo
          etiqueta="Precio al cliente (₡)"
          inputMode="numeric"
          placeholder="15000"
          value={fila.precio}
          onChange={(e) => alCambiar("precio", e.target.value)}
        />
      </div>

      {fila.tipo === "repuesto" && (
        <Campo
          className="mt-4 sm:max-w-xs"
          etiqueta="Me costó (₡)"
          opcional
          inputMode="numeric"
          ayuda="Solo para calcular su ganancia. El cliente no lo ve."
          value={fila.costo}
          onChange={(e) => alCambiar("costo", e.target.value)}
        />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        {error ? <p role="alert" className="text-base font-bold text-rojo">{error}</p> : <span />}
        <div className="flex items-center gap-3">
          <p className="numeros text-lg">
            Subtotal: <strong>{formatoColones(subtotal(fila))}</strong>
          </p>
          <Boton variante="gris" icono={Trash2} onClick={alQuitar} className="min-h-11 px-3">
            Quitar
          </Boton>
        </div>
      </div>
    </div>
  );
}
