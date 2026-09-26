import { useEffect, useState } from "react";
import { Layout } from "../components/layout/Layout";
import { StatCard } from "../components/dashboard/StatCard";
import { AlertaDekra } from "../components/dashboard/AlertaDekra";
import { OrdenesRecientes } from "../components/dashboard/OrdenesRecientes";
import { ActividadReciente } from "../components/dashboard/ActividadReciente";
import { GraficoSemanal } from "../components/dashboard/GraficoSemanal";
import { Car, ClipboardList, Users, DollarSign, Activity, Loader2 } from "lucide-react";
import {
  cargarDatosDashboard,
  sumarIngresos,
  serieSemanal,
  alertasDekra as calcularAlertasDekra,
  firmaDeAlertas,
  marcarRevisionHecha,
} from "../services/dashboard";
import { formatoColones } from "../lib/formato";
import { useAuth } from "../context/AuthContext";

function construirStats(datos) {
  return [
    {
      title: "Vehículos activos",
      value: String(datos.totalVehiculos),
      change: "Registrados en el taller",
      icon: Car,
      color: "blue",
    },
    {
      title: "Órdenes pendientes",
      value: String(datos.ordenesPendientes),
      change: `${datos.ordenesEnProceso} en proceso`,
      icon: ClipboardList,
      color: "red",
    },
    {
      title: "Clientes registrados",
      value: String(datos.totalClientes),
      change: "Base total de clientes",
      icon: Users,
      color: "blue",
    },
    {
      title: "Ingresos del mes",
      value: formatoColones(sumarIngresos(datos.ordenesDelMes)),
      change: `${datos.ordenesDelMes.length} órdenes entregadas`,
      icon: DollarSign,
      color: "red",
    },
  ];
}

export default function Dashboard() {
  const { nombre: nombreCompleto } = useAuth();
  const nombre = nombreCompleto.split(" ")[0] || nombreCompleto;

  const [datos, setDatos] = useState(null); // null = cargando
  const [alertas, setAlertas] = useState([]);
  const [marcandoDekraId, setMarcandoDekraId] = useState(null);
  const [firmaAlertaCerrada, setFirmaAlertaCerrada] = useState(
    () => sessionStorage.getItem("dekra_firma_cerrada") || ""
  );

  useEffect(() => {
    cargarDatosDashboard().then((resultado) => {
      setDatos(resultado);
      setAlertas(calcularAlertasDekra(resultado.vehiculos));
    });
  }, []);

  const cerrarAlertaDekra = () => {
    const firma = firmaDeAlertas(alertas);
    sessionStorage.setItem("dekra_firma_cerrada", firma);
    setFirmaAlertaCerrada(firma);
  };

  const marcarDekraHecha = async (vehiculoId) => {
    setMarcandoDekraId(vehiculoId);
    const { error } = await marcarRevisionHecha(vehiculoId);
    setMarcandoDekraId(null);

    if (!error) setAlertas((prev) => prev.filter((v) => v.id !== vehiculoId));
  };

  const mostrarAlerta =
    datos && alertas.length > 0 && firmaDeAlertas(alertas) !== firmaAlertaCerrada;

  return (
    <Layout>
      <div className="space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-gradient-to-br from-foreground/[0.05] to-transparent p-8 shadow-2xl shadow-black/5">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-card/60 px-4 py-2 text-sm text-foreground/80">
              <Activity className="h-4 w-4 text-accent" />
              Sistema operativo en tiempo real
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
            </h1>

            <p className="mt-4 text-muted-foreground max-w-2xl">
              Panel inteligente del taller
            </p>
          </div>
        </section>

        {mostrarAlerta && (
          <AlertaDekra
            alertas={alertas}
            marcandoId={marcandoDekraId}
            onMarcarHecha={marcarDekraHecha}
            onCerrar={cerrarAlertaDekra}
          />
        )}

        {!datos ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-foreground/10 bg-card/60 p-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando datos del taller...
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {construirStats(datos).map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <OrdenesRecientes ordenes={datos.ultimasOrdenes} />
              <ActividadReciente
                ultimoCliente={datos.ultimoCliente}
                ultimasOrdenes={datos.ultimasOrdenes}
              />
              <GraficoSemanal datos={serieSemanal(datos.ordenesSemana)} />
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
