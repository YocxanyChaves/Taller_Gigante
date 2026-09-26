import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { EncabezadoPortal } from "../components/portal/EncabezadoPortal";
import { SolicitarVinculacion } from "../components/portal/SolicitarVinculacion";
import { MisDatos } from "../components/portal/MisDatos";
import { TarjetaVehiculo } from "../components/portal/TarjetaVehiculo";
import { ModalAgregarVehiculo } from "../components/portal/ModalAgregarVehiculo";
import { cargarMiFicha } from "../services/portal";

export default function ClientePortal() {
  const { user, nombre } = useAuth();
  const [cargando, setCargando] = useState(true);
  const [cliente, setCliente] = useState(null);
  const [agregandoVehiculo, setAgregandoVehiculo] = useState(false);

  useEffect(() => {
    cargarMiFicha().then((ficha) => {
      setCliente(ficha);
      setCargando(false);
    });
  }, []);

  // Después de guardar: se vuelve a pedir la ficha sin mostrar "Cargando".
  const recargar = async () => {
    setCliente(await cargarMiFicha());
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <EncabezadoPortal />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-foreground">
            {nombre ? `Bienvenido, ${nombre}` : "Bienvenido"}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Consulta aquí el estado de tu vehículo y de tus órdenes de trabajo.
          </p>
        </div>

        {cargando ? (
          <div className="flex items-center justify-center gap-3 rounded-3xl border border-foreground/10 bg-card/60 p-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Cargando tu información...
          </div>
        ) : cliente?.bloqueado ? (
          <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/10 p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-yellow-500/15 border border-yellow-500/30 mb-4">
              <ShieldAlert className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">
              Tu perfil está en revisión
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Por ahora no podemos mostrarte la información de tu vehículo.
              Comunícate con el taller si tienes dudas.
            </p>
          </div>
        ) : !cliente ? (
          <SolicitarVinculacion userId={user.id} />
        ) : (
          <>
            <MisDatos cliente={cliente} onGuardado={recargar} />

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Tus vehículos</h3>
              <button
                onClick={() => setAgregandoVehiculo(true)}
                className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-card/60 px-3 py-2 text-sm text-foreground hover:bg-foreground/5 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Agregar vehículo
              </button>
            </div>

            {(cliente.vehiculos || []).length === 0 ? (
              <div className="rounded-3xl border border-foreground/10 bg-card/60 p-10 text-center text-muted-foreground/70 text-sm">
                Todavía no tienes vehículos registrados en el taller.
              </div>
            ) : (
              cliente.vehiculos.map((vehiculo) => (
                <TarjetaVehiculo key={vehiculo.id} vehiculo={vehiculo} />
              ))
            )}
          </>
        )}
      </main>

      {agregandoVehiculo && (
        <ModalAgregarVehiculo
          clienteId={cliente.id}
          onClose={() => setAgregandoVehiculo(false)}
          onGuardado={() => {
            setAgregandoVehiculo(false);
            recargar();
          }}
        />
      )}
    </div>
  );
}
