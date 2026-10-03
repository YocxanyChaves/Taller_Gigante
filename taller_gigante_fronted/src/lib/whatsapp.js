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

// "repuestos ₡72 000 + mano de obra ₡25 000"
function desglose(items) {
  const suma = (tipo) => items.filter((i) => i.tipo === tipo).reduce((s, i) => s + Number(i.subtotal), 0);
  return [
    ["repuestos", suma("repuesto")],
    ["mano de obra", suma("mano_obra")],
    ["otros", suma("otro")],
  ]
    .filter(([, monto]) => monto > 0)
    .map(([texto, monto]) => `${texto} ${formatoColones(monto)}`)
    .join(" + ");
}

// Plantillas (ver la skill, references/pantallas.md).

export function mensajeCotizacion({ cliente, vehiculo, diagnostico, items, total, link }) {
  const partes = [
    `${saludo(cliente)}, le saluda ${TALLER.nombre}.`,
    `Ya revisamos su ${carroCorto(vehiculo)}.`,
    diagnostico ? `Diagnóstico: ${diagnostico.trim()}` : null,
    `Total: ${formatoColones(total)}${items.length > 1 ? ` (${desglose(items)})` : ""}.`,
    `Puede ver el detalle y responder aquí: ${link}`,
  ];
  return partes.filter(Boolean).join("\n");
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

// Lo que escribe el cliente desde su página al taller.
export function mensajeAlTaller({ placa }) {
  return `Hola, le escribo por mi carro${placa ? ` placa ${placa.toUpperCase()}` : ""}.`;
}
