import { Users, CheckCircle2, Clock } from "lucide-react";

// Hasta 3 movimientos: el último cliente, la última orden y la última
// orden completada.
function construirActividad(ultimoCliente, ultimasOrdenes) {
  const eventos = [];

  if (ultimoCliente) {
    eventos.push({
      icon: Users,
      title: "Cliente registrado",
      text: `Se agregó a ${ultimoCliente.nombre} como cliente.`,
    });
  }

  const ultima = ultimasOrdenes[0];
  if (ultima) {
    const completada = ultima.estado === "Completado";
    eventos.push({
      icon: completada ? CheckCircle2 : Clock,
      title: completada ? "Orden completada" : "Orden reciente",
      text: `${ultima.vehiculos?.placa || "Vehículo"} está en estado "${ultima.estado}".`,
    });
  }

  const completada = ultimasOrdenes.find((o) => o.estado === "Completado");
  if (completada) {
    eventos.push({
      icon: CheckCircle2,
      title: "Orden completada",
      text: `${completada.vehiculos?.placa || "Vehículo"} fue marcado como entregado.`,
    });
  }

  return eventos.slice(0, 3);
}

export function ActividadReciente({ ultimoCliente, ultimasOrdenes }) {
  const actividad = construirActividad(ultimoCliente, ultimasOrdenes);

  return (
    <div className="rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5">
      <h2 className="text-xl font-bold text-foreground">Actividad reciente</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Movimientos importantes del sistema
      </p>

      <div className="space-y-5">
        {actividad.length === 0 ? (
          <p className="text-sm text-muted-foreground/70">
            Todavía no hay actividad registrada.
          </p>
        ) : (
          actividad.map((item, i) => <ActivityItem key={i} {...item} />)
        )}
      </div>
    </div>
  );
}

function ActivityItem({ icon: Icon, title, text }) {
  return (
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-2xl bg-foreground/5 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>

      <div>
        <p className="font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
