import { Link } from "react-router-dom";

// Botón con brillo. Siempre lleva texto (el ícono es de apoyo). Un solo botón
// principal (rojo) por pantalla.
//   principal  = la acción más importante de la pantalla
//   secundario = otras acciones
//   peligro    = borrar o cancelar; siempre con <Confirmar>
//   gris       = acciones de poco uso, al final de la pantalla

const VARIANTES = {
  principal:
    "bg-gradient-to-b from-rojo-vivo to-rojo text-white shadow-brillo-rojo hover:brightness-110",
  secundario:
    "border border-azul-vivo/40 bg-azul/10 text-texto hover:bg-azul/20 hover:shadow-brillo-azul",
  peligro: "border border-rojo-vivo/45 bg-rojo/10 text-rojo-vivo hover:bg-rojo/20",
  gris: "border border-white/10 bg-white/[0.03] text-texto-2 hover:bg-white/[0.07] hover:text-texto",
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
    "inline-flex min-h-14 items-center justify-center gap-2 rounded-control px-6 py-2 text-lg font-bold " +
    "transition-[transform,box-shadow,background-color,filter] duration-150 select-none active:scale-[0.97] " +
    "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 disabled:active:scale-100 " +
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
