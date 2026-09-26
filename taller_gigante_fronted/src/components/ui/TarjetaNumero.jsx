import { Link } from "react-router-dom";

// Un dato grande (carros en el taller, por cobrar...). Con `to`, toda la
// tarjeta lleva a su lista.

const COLORES = {
  texto: "text-texto",
  azul: "text-azul-vivo",
  rojo: "text-rojo-vivo",
  cromo: "text-cromo",
};

export default function TarjetaNumero({ etiqueta, valor, detalle, color = "texto", to }) {
  const contenido = (
    <>
      <span className="rotulo block text-base text-texto-2">{etiqueta}</span>
      <span className={`mt-1 block font-mono text-3xl ${COLORES[color]}`}>{valor}</span>
      {detalle && <span className="mt-1 block text-base text-acero">{detalle}</span>}
    </>
  );

  const clases = "block border-2 border-linea bg-panel-hundido p-4 shadow-hundido";

  if (to) {
    return (
      <Link to={to} className={`${clases} hover:border-azul-vivo`}>
        {contenido}
      </Link>
    );
  }

  return <div className={clases}>{contenido}</div>;
}
