import { Check, Info, AlertTriangle, Loader2 } from "lucide-react";

// Caja de aviso debajo de un campo: lo que el sistema encontró o qué pasa.
//   bien    = palomita roja ("Este carro ya vino antes")
//   info    = información neutral ("Carro nuevo")
//   alerta  = hay que hacer algo distinto ("Este carro ya está en el taller")
//   buscando = ruedita girando

const TIPOS = {
  bien: { icono: Check, color: "text-rojo", caja: "border-linea bg-tarjeta" },
  info: { icono: Info, color: "text-gris", caja: "border-linea bg-tarjeta" },
  alerta: { icono: AlertTriangle, color: "text-rojo", caja: "border-rojo/30 bg-rojo/5" },
  buscando: { icono: Loader2, color: "text-gris animate-spin", caja: "border-linea bg-tarjeta" },
};

export default function Aviso({ tipo = "info", titulo, children, accion }) {
  const { icono: Icono, color, caja } = TIPOS[tipo];

  return (
    <div role="status" className={`aparecer mt-4 flex items-start gap-4 rounded-tarjeta border px-5 py-4 ${caja}`}>
      <Icono aria-hidden="true" size={24} strokeWidth={2.6} className={`mt-0.5 shrink-0 ${color}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-lg font-bold">{titulo}</p>
        {children && <div className="text-base text-gris">{children}</div>}
        {accion && <div className="mt-2">{accion}</div>}
      </div>
    </div>
  );
}
