// La placa del carro dibujada como una placa: borde negro y letras separadas.
// Con `roja`, borde y letras rojas (en las tarjetas de clientes).

export default function Placa({ children, grande = false, roja = false }) {
  return (
    <span
      className={`inline-block rounded-md border-2 bg-tarjeta font-bold tracking-[0.12em] whitespace-nowrap ${
        roja ? "border-rojo text-rojo" : "border-tinta"
      } ${grande ? "px-4 py-1.5 text-2xl" : "px-3 py-1 text-lg"}`}
    >
      {children}
    </span>
  );
}
