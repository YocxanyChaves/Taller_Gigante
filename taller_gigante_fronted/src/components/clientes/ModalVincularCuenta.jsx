import { useEffect, useState } from "react";
import { Loader2, Link2, Search } from "lucide-react";
import { Modal, ErrorEnModal } from "../Modal";
import { listarCuentasCliente, vincularCuenta } from "../../services/clientes";
import { mensajeError } from "../../lib/errores";

// Elegir qué cuenta registrada corresponde a la ficha `cliente`. Si la cuenta
// ya tiene otra ficha, se fusionan (ver fusionar_cliente_vinculado).
export function ModalVincularCuenta({ cliente, clientes, onClose, onVinculado }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [vinculando, setVinculando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listarCuentasCliente().then(({ data }) => {
      setUsuarios(data || []);
      setCargando(false);
    });
  }, []);

  const clientePorUsuario = new Map(
    clientes.filter((c) => c.user_id).map((c) => [c.user_id, c])
  );

  const handleVincular = async (usuarioId) => {
    const yaVinculadoA = clientePorUsuario.get(usuarioId);
    if (yaVinculadoA) {
      const confirmado = window.confirm(
        `Esta cuenta ya está vinculada a la ficha "${yaVinculadoA.nombre}". Si continúas, esa ficha se eliminará y su historial (vehículos y órdenes) se trasladará a "${cliente.nombre}". ¿Continuar?`
      );
      if (!confirmado) return;
    }

    setVinculando(true);
    setError("");

    const { error: vinculoError } = await vincularCuenta(cliente.id, usuarioId);

    setVinculando(false);

    if (vinculoError) {
      setError(mensajeError(vinculoError));
      return;
    }

    onVinculado();
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.nombre || "").toLowerCase().includes(q) ||
      (u.correo || "").toLowerCase().includes(q)
    );
  });

  return (
    <Modal onClose={onClose} className="max-w-lg max-h-[80vh] flex flex-col">
      <h2 className="text-xl font-bold mb-1">Vincular cuenta</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Elige la cuenta registrada que corresponde a{" "}
        <span className="font-semibold text-foreground/80">{cliente.nombre}</span>
        . Si esa cuenta ya tiene otra ficha, se fusionarán en una sola.
      </p>

      <ErrorEnModal mensaje={error} />

      <div className="relative mb-4 shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo..."
          className="w-full pl-11 pr-4 py-3 bg-foreground/5 border border-foreground/10 rounded-xl focus:outline-none focus:border-primary"
        />
      </div>

      <div className="overflow-y-auto space-y-2 pr-1">
        {cargando ? (
          <div className="flex items-center justify-center gap-3 p-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Buscando cuentas...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Todavía no hay ninguna cuenta de cliente registrada en el sistema.
          </div>
        ) : (
          usuariosFiltrados.map((usuario) => {
            const yaVinculadoA = clientePorUsuario.get(usuario.id);

            return (
              <button
                key={usuario.id}
                onClick={() => handleVincular(usuario.id)}
                disabled={vinculando}
                className={`w-full flex items-center justify-between gap-3 rounded-2xl border p-4 transition disabled:opacity-60 text-left ${
                  yaVinculadoA
                    ? "border-yellow-500/30 bg-yellow-500/10 hover:bg-yellow-500/20"
                    : "border-foreground/10 bg-card/60 hover:bg-blue-500/10 hover:border-blue-500/30"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {usuario.nombre || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {usuario.correo}
                  </p>
                  {yaVinculadoA && (
                    <p className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 mt-1">
                      Ya vinculada a "{yaVinculadoA.nombre}" — al elegirla se
                      fusionan ambas fichas
                    </p>
                  )}
                </div>
                <Link2 className="h-4 w-4 text-primary shrink-0" />
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
