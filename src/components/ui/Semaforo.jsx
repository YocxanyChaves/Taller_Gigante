// Semaforito de 3 luces con la del estado encendida. La roja late: hay algo
// esperando. Es decorativo: el texto del estado siempre va al lado.
// luz="todas" enciende las tres (el filtro «Todos»).
// Con encendido={false} su luz queda apagada (se ve tenue, sin brillo); al
// pasar a true se enciende con un destello, como un bombillo (lo usa el menú
// de «Carros en el taller»: el elegido se enciende y los demás se apagan).

const LUCES = [
  { nombre: "rojo", encendida: "bg-semaforo-rojo shadow-[0_0_8px_rgb(224_38_47/0.9)] latido", tenue: "bg-semaforo-rojo/35" },
  { nombre: "amarillo", encendida: "bg-amarillo shadow-[0_0_8px_rgb(242_183_5/0.9)]", tenue: "bg-amarillo/35" },
  { nombre: "verde", encendida: "bg-verde shadow-[0_0_8px_rgb(31_157_76/0.9)]", tenue: "bg-verde/35" },
];

export default function Semaforo({ luz, grande = false, encendido = null }) {
  const tamano = grande ? "size-3" : "size-2.5";

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-tinta ${grande ? "px-2 py-1.5" : "px-1.5 py-1"}`}
    >
      {LUCES.map(({ nombre, encendida, tenue }) => {
        const suya = luz === nombre || luz === "todas";
        const clase = !suya
          ? "bg-white/15"
          : encendido === false
            ? tenue
            : `${encendida} ${encendido ? "luz-encender" : ""}`;
        return <span key={nombre} className={`${tamano} rounded-full transition-colors duration-300 ${clase}`} />;
      })}
    </span>
  );
}
