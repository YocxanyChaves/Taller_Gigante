// La placa del carro dibujada como una placa: borde negro y letras separadas.

export default function Placa({ children, grande = false }) {
  return (
    <span
      className={`inline-block rounded-md border-2 border-tinta bg-tarjeta font-bold tracking-[0.12em] whitespace-nowrap ${grande ? "px-4 py-1.5 text-2xl" : "px-3 py-1 text-lg"}`}
    >
      {children}
    </span>
  );
}
