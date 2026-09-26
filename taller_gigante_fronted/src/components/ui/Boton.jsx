import { Link } from "react-router-dom";

// Botón plano con una sombra corta que se "hunde" al tocarlo. Siempre lleva
// texto (el ícono es de apoyo). Un solo botón principal (rojo) por pantalla.
//   principal  = la acción más importante de la pantalla
//   secundario = otras acciones
//   peligro    = borrar o cancelar; siempre con <Confirmar>
//   gris       = acciones de poco uso, al final de la pantalla

const VARIANTES = {
  principal: "bg-rojo text-white border-rojo hover:brightness-110 shadow-boton",
  secundario: "bg-transparent text-texto border-azul-vivo/70 hover:bg-azul/15 shadow-boton",
  peligro: "bg-transparent text-rojo-vivo border-rojo/70 hover:bg-rojo/10 shadow-boton",
  gris: "bg-transparent text-texto-2 border-linea hover:bg-white/5 hover:text-texto",
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
    "inline-flex min-h-14 items-center justify-center gap-2 border px-5 py-2 text-lg font-bold " +
    "transition-[transform,box-shadow,background-color,filter] duration-100 select-none " +
    "active:translate-x-0.5 active:translate-y-0.5 active:shadow-boton-hundido " +
    "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100 " +
    "disabled:active:translate-none disabled:active:shadow-boton " +
    `${VARIANTES[variante]} ${anchoCompleto ? "w-full" : ""} ${className}`;

  const contenido = (
    <>
      {Icono && <Icono aria-hidden="true" size={22} strokeWidth={2.25} />}
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
