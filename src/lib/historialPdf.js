// El historial de un trabajo en PDF, para mandárselo al cliente como
// referencia: el carro, por dónde pasó (con las fotos de cada etapa), el
// diagnóstico, el precio y los pagos. Nunca los costos del taller.
// jsPDF se carga solo al usarlo, para no hacer más lento el sistema.

import logo from "../assets/logo-oscuro.png";
import { ESTADOS } from "./estados";
import { TALLER } from "./taller";
import { fotosPorEtapa } from "./etapas";
import { nombreCarro, formatoTelefono } from "./formato";
import { textoMetodo } from "../services/cobros";

const ANCHO = 210; // A4, en mm
const ALTO = 297;
const MARGEN = 18;
const UTIL = ANCHO - MARGEN * 2;

const TINTA = [26, 26, 26];
const GRIS = [95, 91, 85];
const LINEA = [228, 226, 222];
const ROJO = [179, 19, 31];

// Con el año: el cliente se queda el PDF para siempre. "jueves, 8 de octubre de 2026".
const fecha = (iso, conHora = false) =>
  new Date(iso)
    .toLocaleString("es-CR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      ...(conHora && { hour: "numeric", minute: "2-digit" }),
    })
    .replace("septiembre", "setiembre");

// La letra del PDF no trae el símbolo del colón: se usa ¢, como se escribe a mano.
const colones = (valor) => `¢${Number(valor).toLocaleString("es-CR", { maximumFractionDigits: 0 })}`;

// Una imagen como dataURL con su tamaño, para meterla al PDF.
async function cargarImagen(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error("No se pudo bajar una foto");
  const blob = await respuesta.blob();
  const datos = await new Promise((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result);
    lector.onerror = rechazar;
    lector.readAsDataURL(blob);
  });
  const { width, height } = await new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => resolver(img);
    img.onerror = rechazar;
    img.src = datos;
  });
  return { datos, ancho: width, alto: height };
}

export async function armarHistorialPdf(trabajo, fotos) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Las fotos se bajan todas de una vez; si alguna falla, el PDF sale sin ella.
  const imagenes = await Promise.all(fotos.map((f) => cargarImagen(f.url).catch(() => null)));
  const conImagen = fotos.map((f, i) => ({ ...f, imagen: imagenes[i] })).filter((f) => f.imagen);
  const imagenLogo = await cargarImagen(logo).catch(() => null);

  let y = MARGEN;

  const color = (c) => doc.setTextColor(...c);
  const letra = (tamano, estilo = "normal") => {
    doc.setFont("helvetica", estilo);
    doc.setFontSize(tamano);
  };
  // Si no cabe `alto` en la página, pasa a la siguiente.
  const espacio = (alto) => {
    if (y + alto > ALTO - MARGEN - 10) {
      doc.addPage();
      y = MARGEN;
    }
  };
  const texto = (contenido, { tamano = 11, estilo = "normal", c = TINTA, ancho = UTIL, x = MARGEN, interlineado = 1.35 } = {}) => {
    letra(tamano, estilo);
    color(c);
    const lineas = doc.splitTextToSize(String(contenido), ancho);
    const altoLinea = (tamano * 0.3528) * interlineado;
    for (const linea of lineas) {
      espacio(altoLinea);
      doc.text(linea, x, y + altoLinea * 0.8);
      y += altoLinea;
    }
  };
  const separador = (antes = 4, despues = 6) => {
    y += antes;
    espacio(1);
    doc.setDrawColor(...LINEA);
    doc.setLineWidth(0.3);
    doc.line(MARGEN, y, ANCHO - MARGEN, y);
    y += despues;
  };
  const titulo = (contenido) => {
    espacio(14);
    texto(contenido, { tamano: 14, estilo: "bold" });
    y += 2;
  };
  // Fila de dos columnas: descripción a la izquierda, monto a la derecha.
  const fila = (izquierda, derecha, { estilo = "normal", tamano = 11, c = TINTA } = {}) => {
    letra(tamano, estilo);
    const lineas = doc.splitTextToSize(String(izquierda), UTIL - 40);
    const altoLinea = tamano * 0.3528 * 1.35;
    espacio(altoLinea * lineas.length);
    color(c);
    lineas.forEach((l, i) => doc.text(l, MARGEN, y + altoLinea * (i + 0.8)));
    doc.text(String(derecha), ANCHO - MARGEN, y + altoLinea * 0.8, { align: "right" });
    y += altoLinea * lineas.length + 1;
  };

  // ===== Encabezado =====
  if (imagenLogo) {
    const alto = 14;
    doc.addImage(imagenLogo.datos, "PNG", MARGEN, y, (imagenLogo.ancho / imagenLogo.alto) * alto, alto);
  }
  letra(9);
  color(GRIS);
  doc.text(TALLER.nombre, ANCHO - MARGEN, y + 5, { align: "right" });
  doc.text(`WhatsApp ${formatoTelefono(TALLER.whatsapp)}`, ANCHO - MARGEN, y + 10, { align: "right" });
  y += 22;

  texto("Historial del trabajo", { tamano: 22, estilo: "bold" });
  y += 1;
  const placa = trabajo.vehiculo?.placa?.toUpperCase();
  texto(`${nombreCarro(trabajo.vehiculo)}${placa ? ` · Placa ${placa}` : ""}`, { tamano: 13, c: GRIS });
  if (trabajo.vehiculo?.cliente?.nombre) texto(`Cliente: ${trabajo.vehiculo.cliente.nombre}`, { tamano: 11, c: GRIS });
  texto(`Hecho el ${fecha(new Date().toISOString())}`, { tamano: 9, c: GRIS });

  separador();

  // ===== Qué tenía =====
  titulo("Qué tenía el carro");
  texto("Lo que dijo el cliente", { tamano: 9, estilo: "bold", c: GRIS });
  texto(trabajo.problema_reportado || "No se anotó.");
  if (trabajo.diagnostico) {
    y += 2;
    texto("Lo que encontró el taller", { tamano: 9, estilo: "bold", c: GRIS });
    texto(trabajo.diagnostico);
  }

  separador();

  // ===== Por dónde pasó =====
  titulo("Por dónde pasó el carro");
  const etapas = fotosPorEtapa(
    trabajo.historial.map((h) => ({ ...h, fecha: h.created_at })),
    conImagen
  );
  for (const etapa of etapas) {
    espacio(12);
    doc.setFillColor(...(etapa === etapas.at(-1) ? ROJO : LINEA));
    doc.circle(MARGEN + 1.8, y + 3, 1.8, "F");
    texto(ESTADOS[etapa.estado]?.texto ?? etapa.estado, { tamano: 12, estilo: "bold", x: MARGEN + 7, ancho: UTIL - 7 });
    texto(fecha(etapa.fecha, true), { tamano: 9, c: GRIS, x: MARGEN + 7, ancho: UTIL - 7 });
    y += 2;

    // Fotos de la etapa, de a dos por fila, con su nota abajo.
    const anchoFoto = (UTIL - 7 - 5) / 2;
    for (let i = 0; i < etapa.fotos.length; i += 2) {
      const par = etapa.fotos.slice(i, i + 2);
      const altos = par.map((f) => Math.min(anchoFoto * (f.imagen.alto / f.imagen.ancho), 70));
      const altoFila = Math.max(...altos) + (par.some((f) => f.nota) ? 6 : 0);
      espacio(altoFila + 4);
      par.forEach((f, j) => {
        const x = MARGEN + 7 + j * (anchoFoto + 5);
        const alto = altos[j];
        const ancho = Math.min(anchoFoto, alto * (f.imagen.ancho / f.imagen.alto));
        doc.addImage(f.imagen.datos, "JPEG", x, y, ancho, alto);
        if (f.nota) {
          letra(9);
          color(GRIS);
          doc.text(doc.splitTextToSize(f.nota, anchoFoto)[0], x, y + Math.max(...altos) + 4);
        }
      });
      y += altoFila + 4;
    }
    y += 3;
  }

  // ===== Precio y pagos =====
  const items = trabajo.items ?? [];
  const totales = trabajo.totales ?? {};
  if (items.length || Number(totales.total) > 0) {
    separador();
    titulo("Precio");
    for (const item of items) {
      const cantidad = Number(item.cantidad) !== 1 ? ` × ${Number(item.cantidad)}` : "";
      fila(`${item.descripcion}${cantidad}`, colones(item.subtotal));
    }
    if (trabajo.aprobada === false && Number(trabajo.cobro_revision) > 0) {
      fila("Como no se hizo el trabajo, solo se cobró la revisión.", "", { tamano: 9, c: GRIS });
    }
    y += 2;
    fila("Total", colones(totales.total ?? 0), { estilo: "bold", tamano: 13 });

    const pagos = trabajo.pagos ?? [];
    if (pagos.length) {
      y += 3;
      texto("Pagos", { tamano: 9, estilo: "bold", c: GRIS });
      for (const p of pagos) {
        fila(`${fecha(p.pagado_en)} · ${textoMetodo(p.metodo)}`, colones(p.monto), { c: GRIS });
      }
      y += 1;
      if (Number(totales.saldo) > 0) {
        fila("Falta por pagar", colones(totales.saldo), { estilo: "bold", c: ROJO });
      } else {
        fila("Pagado completo", "", { estilo: "bold" });
      }
    }
  }

  // ===== Pie en cada página =====
  const paginas = doc.getNumberOfPages();
  for (let p = 1; p <= paginas; p++) {
    doc.setPage(p);
    letra(8);
    color(GRIS);
    doc.text(`${TALLER.nombre} · Este documento no es una factura.`, MARGEN, ALTO - 10);
    doc.text(`Página ${p} de ${paginas}`, ANCHO - MARGEN, ALTO - 10, { align: "right" });
  }

  const nombre = `historial-${placa || `trabajo-${trabajo.id}`}.pdf`;
  return { doc, nombre };
}

// En el celular: abre «Compartir» con el PDF adjunto (para mandarlo por
// WhatsApp). Devuelve false si el aparato no sabe compartir archivos.
export async function compartirPdf({ doc, nombre }) {
  const archivo = new File([doc.output("blob")], nombre, { type: "application/pdf" });
  if (!navigator.canShare?.({ files: [archivo] })) return false;
  try {
    await navigator.share({ files: [archivo], title: "Historial del trabajo" });
  } catch (e) {
    // Si la persona cerró «Compartir» sin escoger nada, no es un error.
    if (e.name !== "AbortError") throw e;
  }
  return true;
}

export const puedeCompartirArchivos = () =>
  typeof navigator !== "undefined" &&
  !!navigator.canShare?.({ files: [new File([""], "prueba.pdf", { type: "application/pdf" })] });
