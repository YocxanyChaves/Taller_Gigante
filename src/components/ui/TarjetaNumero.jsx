import { Link } from "react-router-dom";
import useContar from "../../lib/useContar";

// Un dato grande (carros listos, por cobrar...) que cuenta hacia arriba al
// aparecer. `formato` convierte el número en texto (por ejemplo, colones).
// Con `to`, toda la tarjeta lleva a su lista.

const COLORES = {
  tinta: "text-tinta",
  rojo: "text-rojo",
  verde: "text-verde-texto",
  amarillo: "text-amarillo-texto",
};

export default function TarjetaNumero({ etiqueta, valor, formato = String, detalle, color = "tinta", to }) {
  const actual = useContar(valor);

  const contenido = (
    <>
      <span className="block text-lg text-gris">{etiqueta}</span>
      <span className={`numeros mt-1 block text-4xl font-bold whitespace-nowrap ${COLORES[color]}`}>
        {formato(actual)}
      </span>
      {detalle && <span className="mt-1 block text-base text-gris">{detalle}</span>}
    </>
  );

  const clases = "block rounded-tarjeta border border-linea bg-tarjeta p-5 shadow-tarjeta";

  if (to) {
    return (
      <Link
        to={to}
        className={`${clases} transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-elevada`}
      >
        {contenido}
      </Link>
    );
  }

  return <div className={clases}>{contenido}</div>;
}
