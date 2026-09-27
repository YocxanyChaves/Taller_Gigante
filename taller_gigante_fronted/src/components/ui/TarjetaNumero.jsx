import { Link } from "react-router-dom";

// Un dato grande (carros en el taller, por cobrar...). El número brilla con
// su color y una luz del mismo color se asoma en la esquina. Con `to`, toda
// la tarjeta lleva a su lista.

const COLORES = {
  texto: { numero: "text-texto", luz: "bg-acero/25" },
  azul: { numero: "text-azul-vivo", luz: "bg-azul-vivo/30" },
  rojo: { numero: "text-rojo-vivo", luz: "bg-rojo-vivo/30" },
  cromo: { numero: "text-cromo", luz: "bg-cromo/20" },
};

export default function TarjetaNumero({ etiqueta, valor, detalle, color = "texto", to }) {
  const { numero, luz } = COLORES[color];

  const contenido = (
    <>
      <span aria-hidden="true" className={`absolute -top-10 -right-10 size-28 rounded-full blur-2xl ${luz}`} />
      <span className="rotulo relative block text-base text-texto-2">{etiqueta}</span>
      <span className={`numero-brillo relative mt-2 block font-mono text-3xl whitespace-nowrap xl:text-4xl ${numero}`}>{valor}</span>
      {detalle && <span className="relative mt-1 block text-base text-acero">{detalle}</span>}
    </>
  );

  const clases = "vidrio relative block overflow-hidden p-5";

  if (to) {
    return (
      <Link to={to} className={`${clases} transition-transform hover:-translate-y-0.5`}>
        {contenido}
      </Link>
    );
  }

  return <div className={clases}>{contenido}</div>;
}
