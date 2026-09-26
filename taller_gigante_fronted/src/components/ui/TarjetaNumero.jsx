import { Link } from "react-router-dom";

// Un dato grande (carros en el taller, por cobrar...). La rayita de arriba
// lleva el color del dato. Con `to`, toda la tarjeta lleva a su lista.

const COLORES = {
  texto: { numero: "text-texto", raya: "bg-acero" },
  azul: { numero: "text-azul-vivo", raya: "bg-azul-vivo" },
  rojo: { numero: "text-rojo-vivo", raya: "bg-rojo-vivo" },
  cromo: { numero: "text-cromo", raya: "bg-cromo" },
};

export default function TarjetaNumero({ etiqueta, valor, detalle, color = "texto", to }) {
  const { numero, raya } = COLORES[color];

  const contenido = (
    <>
      <span aria-hidden="true" className={`mb-3 block h-0.5 w-8 ${raya}`} />
      <span className="rotulo block text-base text-texto-2">{etiqueta}</span>
      <span className={`mt-1 block font-mono text-3xl ${numero}`}>{valor}</span>
      {detalle && <span className="mt-0.5 block text-base text-acero">{detalle}</span>}
    </>
  );

  const clases = "block border border-linea bg-panel p-4";

  if (to) {
    return (
      <Link to={to} className={`${clases} transition-colors hover:border-azul-vivo/60`}>
        {contenido}
      </Link>
    );
  }

  return <div className={clases}>{contenido}</div>;
}
