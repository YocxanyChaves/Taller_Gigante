// La placa del carro dibujada como una placa: borde negro y letras separadas.
// Con `tocable` (dentro de una tarjeta .group, como la de un cliente), al pasar
// el mouse por la tarjeta la placa se pinta toda de rojo con letras negras.

export default function Placa({ children, grande = false, tocable = false }) {
  return (
    <span
      className={`inline-block rounded-md border-2 bg-tarjeta font-bold tracking-[0.12em] whitespace-nowrap ${
        tocable
          ? "border-tinta transition-colors duration-200 group-hover:border-rojo group-hover:bg-rojo group-hover:text-tinta"
          : "border-tinta"
      } ${grande ? "px-4 py-1.5 text-2xl" : "px-3 py-1 text-lg"}`}
    >
      {children}
    </span>
  );
}
