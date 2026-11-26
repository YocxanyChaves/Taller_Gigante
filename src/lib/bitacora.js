import { ESTADOS } from "./estados";
import { formatoColones, fechaLarga } from "./formato";
import { TEXTO_GASOLINA } from "./llegada";
import { textoMetodo } from "../services/cobros";

// Cómo leer un renglón de la bitácora (tabla `bitacora`): una frase de qué se
// hizo y, debajo, cada dato que cambió en palabras del taller ("Etapa: En
// revisión → Listo para recoger").

const AREAS = { repuesto: "Repuestos", mano_obra: "Mano de obra", otro: "Otros cobros" };
const FORMAS_PAGO = { contado: "De contado", cuotas: "En cuotas" };

// Nombre de cada dato y cómo se muestra. Lo que no está aquí no se muestra.
const PLATA = (v) => formatoColones(v);
// Un día solo ("2026-11-25") se lee en hora local, no UTC (si no, saldría un día antes).
const FECHA = (v) => fechaLarga(/^\d{4}-\d{2}-\d{2}$/.test(v) ? `${v}T00:00` : v);
const FECHA_HORA = (v) => fechaLarga(v, true);
const SI_NO = (v) => (v ? "Sí" : "No");

const CAMPOS = {
  ordenes: {
    estado: ["Etapa", (v) => ESTADOS[v]?.texto ?? v],
    problema_reportado: ["Qué dijo el cliente"],
    diagnostico: ["Diagnóstico"],
    fecha_cita: ["Cita", FECHA],
    fecha_ingreso: ["Fecha de entrada", FECHA],
    fecha_entrega: ["Entregado", FECHA],
    km_entrada: ["Lectura del tablero al llegar", (v) => Number(v).toLocaleString("es-CR")],
    millas_entrada: ["Millas al llegar", (v) => `${Number(v).toLocaleString("es-CR")} millas`],
    unidad_distancia: ["El tablero marca", (v) => (v === "mi" ? "millas" : "kilómetros")],
    nivel_combustible: ["Gasolina", (v) => TEXTO_GASOLINA[v] ?? v],
    notas_recepcion: ["Cómo llegó"],
    aprobada: ["¿Aprobó el precio?", SI_NO],
    respondida_en: ["Respondió", FECHA_HORA],
    comentario_cliente: ["Comentario del cliente"],
    modalidad_pago: ["Forma de pago", (v) => FORMAS_PAGO[v] ?? v],
    cobro_revision: ["Cobro de revisión", PLATA],
    fecha_proximo_pago: ["Próximo pago", FECHA],
  },
  orden_items: {
    tipo: ["Área", (v) => AREAS[v] ?? v],
    descripcion: ["Qué es"],
    cantidad: ["Cantidad", (v) => Number(v).toLocaleString("es-CR")],
    precio_unitario: ["Precio al cliente", PLATA],
    costo_unitario: ["Le costó", PLATA],
  },
  pagos: {
    monto: ["Monto", PLATA],
    metodo: ["Cómo pagó", (v) => textoMetodo(v)],
    nota: ["Nota"],
    pagado_en: ["Fecha del pago", FECHA],
  },
  clientes: {
    nombre: ["Nombre"],
    telefono: ["Teléfono"],
    correo: ["Correo"],
    direccion: ["Dirección"],
  },
  vehiculos: {
    placa: ["Placa", (v) => String(v).toUpperCase()],
    marca: ["Marca"],
    modelo: ["Modelo"],
    anio: ["Año"],
    color: ["Color"],
    tipo_motor: ["Motor"],
    kilometraje: ["Última lectura", (v) => Number(v).toLocaleString("es-CR")],
    unidad_distancia: ["El tablero marca", (v) => (v === "mi" ? "millas" : "kilómetros")],
    ultima_revision_tecnica: ["Última vez en DEKRA", FECHA],
  },
  orden_fotos: {
    tipo: ["Tipo"],
    nota: ["Nota"],
  },
};

const valorDe = (formato, v) => (v == null || v === "" ? "(vacío)" : formato ? formato(v) : String(v));

// Los datos que cambiaron, ya en palabras: [{ etiqueta, antes, despues }].
export function detallesBitacora(renglon) {
  const campos = CAMPOS[renglon.tabla] ?? {};
  return Object.entries(renglon.cambios ?? {})
    .filter(([campo]) => campos[campo])
    .map(([campo, { antes, despues }]) => {
      const [etiqueta, formato] = campos[campo];
      return {
        etiqueta,
        antes: antes === undefined ? undefined : valorDe(formato, antes),
        despues: despues === undefined ? undefined : valorDe(formato, despues),
      };
    });
}

const dato = (renglon, campo) => {
  const c = renglon.cambios?.[campo];
  return c ? (c.despues ?? c.antes) : null;
};

// La frase de qué se hizo, con su emoji.
export function fraseBitacora(r) {
  const { tabla, accion } = r;
  if (tabla === "ordenes") {
    if (accion === "crear") return { emoji: "🆕", texto: "Abrió un trabajo" };
    if (accion === "borrar") return { emoji: "🗑️", texto: "Borró un trabajo" };
    const estado = r.cambios?.estado?.despues;
    if (estado) return { emoji: "🚦", texto: `Pasó a «${ESTADOS[estado]?.texto ?? estado}»` };
    if (r.cambios?.diagnostico) return { emoji: "🩺", texto: "Cambió el diagnóstico" };
    return { emoji: "✏️", texto: "Cambió datos del trabajo" };
  }
  if (tabla === "orden_items") {
    const que = dato(r, "descripcion");
    if (accion === "crear") return { emoji: "➕", texto: `Agregó al precio: ${que ?? "un cobro"}` };
    if (accion === "borrar") return { emoji: "➖", texto: `Quitó del precio: ${que ?? "un cobro"}` };
    return { emoji: "💲", texto: `Cambió un cobro${que ? `: ${que}` : ""}` };
  }
  if (tabla === "pagos") {
    const monto = dato(r, "monto");
    if (accion === "crear") return { emoji: "💰", texto: `Registró un pago${monto ? ` de ${formatoColones(monto)}` : ""}` };
    if (accion === "borrar") return { emoji: "🗑️", texto: "Borró un pago" };
    return { emoji: "✏️", texto: "Cambió un pago" };
  }
  if (tabla === "clientes") {
    if (accion === "crear") return { emoji: "👤", texto: "Anotó un cliente nuevo" };
    if (accion === "borrar") return { emoji: "🗑️", texto: "Borró un cliente" };
    return { emoji: "✏️", texto: "Cambió datos del cliente" };
  }
  if (tabla === "vehiculos") {
    if (accion === "crear") return { emoji: "🚗", texto: "Anotó un carro nuevo" };
    if (accion === "borrar") return { emoji: "🗑️", texto: "Borró un carro" };
    if (r.cambios?.ultima_revision_tecnica) return { emoji: "📋", texto: "Marcó que pasó DEKRA" };
    return { emoji: "✏️", texto: "Cambió datos del carro" };
  }
  if (tabla === "orden_fotos") {
    if (accion === "crear") return { emoji: "📷", texto: "Subió una foto o video" };
    if (accion === "borrar") return { emoji: "🗑️", texto: "Borró una foto o video" };
    return { emoji: "✏️", texto: "Cambió la nota de una foto" };
  }
  return { emoji: "✏️", texto: "Hizo un cambio" };
}

// Al crear algo, la frase ya lo dice: solo se muestran los detalles de lo que
// se creó si es un cliente, un carro o un trabajo (para saber cuál).
export const mostrarDetalles = (r) =>
  r.accion === "cambiar" || ["ordenes", "clientes", "vehiculos", "pagos"].includes(r.tabla);
