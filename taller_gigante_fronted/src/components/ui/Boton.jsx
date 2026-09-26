import { Link } from "react-router-dom";

// Botón con relieve: al tocarlo se "hunde". Siempre lleva texto (el ícono es
// de apoyo). Un solo botón principal (rojo) por pantalla.
//   principal  = la acción más importante de la pantalla
//   secundario = otras acciones
//   peligro    = borrar o cancelar; siempre con <Confirmar>
//   gris       = acciones de poco uso, al final de la pantalla

const VARIANTES = {
  principal: "bg-rojo text-white border-black",
  secundario: "bg-panel text-texto border-azul",
  peligro: "bg-panel text-rojo-vivo border-rojo",
  gris: "bg-panel text-texto-2 border-linea",
};

export default function Boton({
  variante = "principal",
  icono: Icono,
  children,
  to,
  anchoCompleto = false,
  className = "",
  ...props
}) {
  const clases =
    "inline-flex min-h-14 items-center justify-center gap-2 border-2 px-5 py-2 text-lg font-bold " +
    "shadow-boton transition-[transform,box-shadow] duration-75 select-none " +
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-boton-hundido " +
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-none disabled:active:shadow-boton " +
    `${VARIANTES[variante]} ${anchoCompleto ? "w-full" : ""} ${className}`;

  const contenido = (
    <>
      {Icono && <Icono aria-hidden="true" size={22} strokeWidth={2.5} />}
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {contenido}
      </Link>
    );
  }

  return (
    <button type="button" className={clases} {...props}>
      {contenido}
    </button>
  );
}
