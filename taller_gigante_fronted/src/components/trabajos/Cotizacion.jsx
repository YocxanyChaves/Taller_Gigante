import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { guardarCotizacion } from "../../services/trabajos";
import { formatoColones, soloDigitos } from "../../lib/formato";
import { mensajeError } from "../../lib/errores";
import Campo from "../ui/Campo";
import Boton from "../ui/Boton";

// El precio del trabajo: diagnóstico y filas (repuestos, mano de obra, otros).
// Se ve como lista; con "Cambiar el precio" se edita con el total en vivo.
// "Me costó" es opcional y solo en repuestos: sirve para la ganancia y el
// cliente nunca lo ve.

const TIPOS = [
  { valor: "repuesto", texto: "Repuesto", ejemplo: "Pastillas de freno" },
  { valor: "mano_obra", texto: "Mano de obra", ejemplo: "Cambio de pastillas" },
  { valor: "otro", texto: "Otro", ejemplo: "Revisión" },
];
const NOMBRE_TIPO = Object.fromEntries(TIPOS.map((t) => [t.valor, t.texto]));

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
const filaNueva = (tipo = "repuesto") => ({
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

function errorDeFila(fila) {
  if (!fila.descripcion.trim()) return "Escriba qué es.";
  if (!(aCantidad(fila.cantidad) > 0)) return "La cantidad tiene que ser mayor que 0.";
  if (aNumero(fila.precio) == null) return "Escriba el precio.";
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
              <ul className="mt-5 divide-y divide-linea border-y border-linea">
                {trabajo.items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="text-lg font-bold break-words">{item.descripcion}</p>
                      <p className="text-base text-gris">
                        {NOMBRE_TIPO[item.tipo]}
                        {Number(item.cantidad) !== 1 &&
                          ` · ${Number(item.cantidad)} × ${formatoColones(item.precio_unitario)}`}
                        {item.tipo === "repuesto" &&
                          item.costo_unitario != null &&
                          ` · le costó ${formatoColones(item.costo_unitario)}`}
                      </p>
                    </div>
                    <p className="numeros shrink-0 text-lg font-bold">{formatoColones(item.subtotal)}</p>
                  </li>
                ))}
              </ul>
            )}
            {trabajo.items.length > 0 && (
              <div className="mt-4 flex items-baseline justify-between">
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

  const guardar = async () => {
    setIntento(true);
    if (filas.length === 0 || filas.some(errorDeFila)) return;
    setGuardando(true);
    setError("");
    try {
      await guardarCotizacion(
        trabajo.id,
        diagnostico,
        filas.map((f) => ({
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
      <div className="flex flex-col gap-6 p-6">
        <Campo
          etiqueta="Qué tiene el carro"
          multilinea
          autoFocus
          placeholder="Por ejemplo: pastillas delanteras gastadas y discos rayados."
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />

        <div className="flex flex-col gap-4">
          <p className="text-lg font-bold">Lo que se cobra</p>
          {filas.map((fila, i) => (
            <FilaEditable
              key={fila.clave}
              numero={i + 1}
              fila={fila}
              error={intento ? errorDeFila(fila) : null}
              alCambiar={(campo, valor) => cambiarFila(fila.clave, campo, valor)}
              alQuitar={() => setFilas((fs) => fs.filter((f) => f.clave !== fila.clave))}
            />
          ))}
          {intento && filas.length === 0 && (
            <p role="alert" className="text-lg font-bold text-rojo">Agregue al menos una fila con el precio.</p>
          )}
          <Boton variante="secundario" icono={Plus} className="self-start" onClick={() => setFilas((fs) => [...fs, filaNueva()])}>
            Agregar otra fila
          </Boton>
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

function FilaEditable({ numero, fila, error, alCambiar, alQuitar }) {
  const ejemplo = TIPOS.find((t) => t.valor === fila.tipo)?.ejemplo;

  return (
    <div className="animar-entrada rounded-tarjeta border border-linea bg-fondo p-3 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label={`Tipo de la fila ${numero}`}
          className="grid w-full grid-cols-3 gap-1 rounded-control bg-suave p-1 sm:inline-flex sm:w-auto"
        >
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              aria-pressed={fila.tipo === t.valor}
              onClick={() => alCambiar("tipo", t.valor)}
              className={
                "min-h-11 rounded-lg px-2 text-base leading-tight font-bold transition-colors sm:px-3 " +
                (fila.tipo === t.valor ? "bg-tarjeta text-tinta shadow-elevada" : "text-gris hover:text-tinta")
              }
            >
              {t.texto}
            </button>
          ))}
        </div>
        <Boton variante="gris" icono={Trash2} onClick={alQuitar} className="min-h-11 px-3">
          Quitar
        </Boton>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_10rem]">
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
          etiqueta="Precio (₡)"
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

      <div className="mt-3 flex items-center justify-between gap-3">
        {error ? <p role="alert" className="text-base font-bold text-rojo">{error}</p> : <span />}
        <p className="numeros text-lg">
          Subtotal: <strong>{formatoColones(subtotal(fila))}</strong>
        </p>
      </div>
    </div>
  );
}
