import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from "recharts";

// Órdenes ingresadas en los últimos 7 días. `datos`: [{ day, orders }].
export function GraficoSemanal({ datos }) {
  return (
    <div className="xl:col-span-3 rounded-3xl border border-foreground/10 bg-card/60 p-6 shadow-2xl shadow-black/5 overflow-hidden relative">
      <div className="absolute top-0 right-0 h-56 w-56 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 h-56 w-56 bg-red-500/10 blur-3xl rounded-full" />

      <div className="relative z-10 mb-6">
        <h2 className="text-2xl font-black tracking-tight text-foreground">
          Rendimiento semanal
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Órdenes ingresadas en los últimos 7 días
        </p>
      </div>

      <div className="h-[320px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="day"
              stroke="currentColor"
              className="text-muted-foreground/60"
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "white",
              }}
            />

            <Area
              type="monotone"
              dataKey="orders"
              stroke="#3b82f6"
              strokeWidth={4}
              fill="url(#colorOrders)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
