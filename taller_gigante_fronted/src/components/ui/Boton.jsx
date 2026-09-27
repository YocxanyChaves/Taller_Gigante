import { Link } from "react-router-dom";

// Botón grande que se levanta al pasar el mouse y se aprieta al tocarlo.
// Siempre lleva texto (el ícono es de apoyo). Un solo botón rojo por pantalla.
//   principal  = la acción más importante de la pantalla
//   secundario = otras acciones
//   peligro    = borrar o cancelar; siempre con <Confirmar>
//   gris       = acciones de poco uso, como un enlace

const VARIANTES = {
  principal:
    "bg-rojo text-white hover:bg-rojo-oscuro hover:shadow-boton-rojo hover:-translate-y-0.5",
  secundario:
    "border-2 border-linea-fuerte bg-tarjeta text-tinta hover:border-tinta hover:-translate-y-0.5 hover:shadow-elevada",
  peligro:
    "border-2 border-rojo/40 bg-tarjeta text-rojo hover:border-rojo hover:bg-rojo/5 hover:-translate-y-0.5",
  gris: "text-gris hover:bg-suave hover:text-tinta",
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
    "group inline-flex min-h-14 items-center justify-center gap-2.5 rounded-control px-7 py-2 text-lg font-bold " +
    "transition-[transform,box-shadow,background-color,border-color,color] duration-200 select-none " +
    "active:translate-y-0 active:scale-[0.97] " +
    "disabled:pointer-events-none disabled:opacity-40 " +
    `${VARIANTES[variante]} ${anchoCompleto ? "w-full" : ""} ${className}`;

  const contenido = (
    <>
      {Icono && <Icono aria-hidden="true" size={22} strokeWidth={2.4} className="menear" />}
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
