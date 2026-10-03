// Datos del taller para la página del cliente y los mensajes de WhatsApp.
// TEMPORAL: el WhatsApp es el número de la dueña hasta tener el del taller.
// (El nombre también sale de get_trabajo_publico() en la base.)

export const TALLER = {
  nombre: "Taller Mecánico Gigante",
  whatsapp: "83931634",
};

// Dirección desde la que se arman los links del cliente. En la compu es
// localhost; al publicar el sistema se pone VITE_URL_PUBLICA en el .env.
export const URL_PUBLICA = (import.meta.env.VITE_URL_PUBLICA || window.location.origin).replace(/\/$/, "");

export const linkCliente = (token) => `${URL_PUBLICA}/t/${token}`;
