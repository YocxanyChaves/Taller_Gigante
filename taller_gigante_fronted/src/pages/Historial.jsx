import { useEffect, useMemo, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { supabase } from "../lib/supabaseClient";
import { History, Search, Loader2, CheckCircle2 } from "lucide-react";

export default function Historial() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchHistorial = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("ordenes")
        .select(
          "id, descripcion, diagnostico, costo_final, fecha_entrega, vehiculos(placa, marca, modelo, clientes(nombre))"
        )
        .eq("estado", "Completado")
        .order("fecha_entrega", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setOrdenes(data);
      }

      setLoading(false);
    };

    fetchHistorial();
  }, []);

  const ordenesFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return ordenes;

    return ordenes.filter((orden) => {
      const cliente = orden.vehiculos?.clientes?.nombre?.toLowerCase() || "";
      const placa = orden.vehiculos?.placa?.toLowerCase() || "";
      return cliente.includes(termino) || placa.includes(termino);
    });
  }, [ordenes, busqueda]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-foreground">
              <History className="h-6 w-6 text-primary" />
              Historial
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Órdenes completadas y entregadas
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/60 px-4 py-3 w-full md:w-80">
            <Search className="h-4 w-4 text-muted-foreground/70" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por cliente o placa..."
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        <div className="rounded-3xl border border-foreground/10 bg-card/60 shadow-2xl shadow-black/5 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando historial...
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <History className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {ordenes.length === 0
                  ? "Todavía no hay órdenes completadas."
                  : "No hay resultados para esa búsqueda."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">
              <thead className="bg-card/80 text-muted-foreground">
                <tr>
                  <th className="text-left p-4">Orden</th>
                  <th className="text-left p-4">Vehículo</th>
                  <th className="text-left p-4">Cliente</th>
                  <th className="text-left p-4">Descripción</th>
                  <th className="text-left p-4">Costo final</th>
                  <th className="text-left p-4">Entregado</th>
                </tr>
              </thead>

              <tbody>
                {ordenesFiltradas.map((orden) => (
                  <tr
                    key={orden.id}
                    className="border-t border-foreground/10 hover:bg-card/40 transition"
                  >
                    <td className="p-4 font-semibold text-foreground">#TG-{orden.id}</td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos
                        ? `${orden.vehiculos.placa} · ${[
                            orden.vehiculos.marca,
                            orden.vehiculos.modelo,
                          ]
                            .filter(Boolean)
                            .join(" ")}`
                        : "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.vehiculos?.clientes?.nombre || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">
                      {orden.descripcion || "—"}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {orden.costo_final || "—"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {orden.fecha_entrega
                          ? new Date(orden.fecha_entrega).toLocaleDateString(
                              "es-CR"
                            )
                          : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
