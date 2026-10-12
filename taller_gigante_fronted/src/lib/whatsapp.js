import { formatoColones, soloDigitos } from "./formato";
import { TALLER } from "./taller";

// WhatsApp gratis: se abre wa.me con el mensaje ya escrito y el tío solo le
// da enviar. Nada de WhatsApp API (cuesta).

// "8888-1111" → "50688881111". null si no son 8 números.
export function telefonoWhatsApp(telefono) {
  const digitos = soloDigitos(telefono).slice(-8);
  return digitos.length === 8 ? `506${digitos}` : null;
}

// Link que abre WhatsApp con el mensaje escrito. Sin teléfono, WhatsApp deja
// escoger a quién mandarlo.
export function enlaceWhatsApp(telefono, texto) {
  const numero = telefonoWhatsApp(telefono);
  return `https://wa.me/${numero ?? ""}?text=${encodeURIComponent(texto)}`;
}

const primerNombre = (nombre) => (nombre ?? "").trim().split(/\s+/)[0] || "";
const saludo = (nombre) => (primerNombre(nombre) ? `Hola ${primerNombre(nombre)}` : "Hola");
const carroCorto = ({ marca, placa }) =>
  [marca ? marca.charAt(0).toUpperCase() + marca.slice(1) : "carro", placa ? `placa ${placa.toUpperCase()}` : ""]
    .filter(Boolean)
    .join(" ");

// Las partes del precio, en el orden en que se le explican al cliente.
// (*texto* sale en negrita en WhatsApp.)
const SECCIONES = [
  { tipo: "repuesto", titulo: "🔩 *Repuestos que ocupa*" },
  { tipo: "mano_obra", titulo: "🛠️ *Mano de obra*" },
  { tipo: "otro", titulo: "➕ *Otros*" },
];

// "• Pastillas de freno: ₡30 000" o, si son varios,
// "• Aceite (4 × ₡6 000): ₡24 000".
function lineaItem({ descripcion, cantidad, precio_unitario, subtotal }) {
  const varios = Number(cantidad) !== 1 ? ` (${Number(cantidad)} × ${formatoColones(precio_unitario)})` : "";
  return `• ${descripcion.trim()}${varios}: ${formatoColones(subtotal)}`;
}

// Plantillas (ver la skill, references/pantallas.md).

// Resumen del precio: qué tiene el carro, cada repuesto con su precio, la
// mano de obra y el total bien visible, con el link para aprobar.
export function mensajeCotizacion({ cliente, vehiculo, diagnostico, items, total, link }) {
  const bloques = [
    `${saludo(cliente)} 👋, le saluda *${TALLER.nombre}*.\nYa revisamos su *${carroCorto(vehiculo)}* 🚗`,
    diagnostico?.trim() ? `🔍 *Lo que encontramos*\n${diagnostico.trim()}` : null,
    ...SECCIONES.map(({ tipo, titulo }) => {
      const delTipo = items.filter((i) => i.tipo === tipo);
      return delTipo.length ? [titulo, ...delTipo.map(lineaItem)].join("\n") : null;
    }),
    `💰 *Todo le sale en: ${formatoColones(total)}*`,
    `👉 Para ver el detalle y decirnos si le hacemos el trabajo, toque aquí:\n${link}`,
    "¡Quedamos atentos! 🙌",
  ];
  return bloques.filter(Boolean).join("\n\n");
}

export function mensajeListo({ cliente, vehiculo, total, link }) {
  return [
    `${saludo(cliente)}, su ${carroCorto(vehiculo)} ya está listo para recoger.`,
    total > 0 ? `Total: ${formatoColones(total)}.` : null,
    `Detalle: ${link}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function mensajeLink({ cliente, vehiculo, link }) {
  return `${saludo(cliente)}, le saluda ${TALLER.nombre}. Aquí puede ver cómo va su ${carroCorto(vehiculo)}: ${link}`;
}

export function mensajeRecordatorio({ cliente, vehiculo, saldo, link }) {
  return `${saludo(cliente)}, le recordamos que queda un saldo de ${formatoColones(saldo)} por el trabajo de su ${carroCorto(vehiculo)}. Detalle: ${link}. ¡Gracias!`;
}

// Para escribirle al cliente desde su ficha, sin un trabajo de por medio.
export function mensajeSaludo({ nombre }) {
  return `${saludo(nombre)}, le saluda ${TALLER.nombre}.`;
}

// Lo que escribe el cliente desde su página al taller.
export function mensajeAlTaller({ placa }) {
  return `Hola, le escribo por mi carro${placa ? ` placa ${placa.toUpperCase()}` : ""}.`;
}
