import { useEffect, useMemo, useState } from "react";
import { Car, SearchX } from "lucide-react";
import { listarCarros } from "../../services/trabajos";
import { nombreCarro, normalizarPlaca, soloDigitos } from "../../lib/formato";
import Campo from "../ui/Campo";
import Aviso from "../ui/Aviso";
import Eleccion from "../ui/Eleccion";
import Vacio from "../ui/Vacio";

// "Ya está registrado": la lista de carros con el nombre del dueño en grande,
// porque el tío se acuerda de la persona, no de la placa. Se filtra por nombre
// (sin importar tildes), teléfono o placa.

const MAXIMO = 40;
const sinTildes = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "") // quita las tildes
    .toLowerCase();

export default function ElegirCarro({ elegidoId, alElegir }) {
  const [carros, setCarros] = useState(null); // null = cargando
  const [fallo, setFallo] = useState(false);
  const [texto, setTexto] = useState("");

  useEffect(() => {
    let vigente = true;
    listarCarros()
      .then((lista) => vigente && setCarros(lista))
      .catch(() => vigente && setFallo(true));
    return () => {
      vigente = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    if (!carros) return [];
    const nombre = sinTildes(texto.trim());
    const digitos = soloDigitos(texto);
    const placa = normalizarPlaca(texto);
    return carros
      .filter(
        (c) =>
          c.placa &&
          (!nombre ||
            sinTildes(c.cliente_nombre).includes(nombre) ||
            (digitos.length >= 3 && soloDigitos(c.cliente_telefono).includes(digitos)) ||
            (placa.length >= 2 && normalizarPlaca(c.placa).includes(placa)))
      )
      .sort((a, b) => {
        // Los que no tienen dueño, al final.
        if (!a.cliente_id !== !b.cliente_id) return a.cliente_id ? -1 : 1;
        return (a.cliente_nombre ?? "").localeCompare(b.cliente_nombre ?? "", "es");
      });
  }, [carros, texto]);

  if (fallo) {
    return (
      <Aviso tipo="alerta" titulo="No se pudo traer la lista de carros">
        Revise el internet e intente de nuevo.
      </Aviso>
    );
  }

  return (
    <>
      <Campo
        etiqueta="Busque por el nombre del dueño"
        type="search"
        autoFocus
        autoComplete="off"
        placeholder="Carlos, 8888 1111 o BTR-482"
        ayuda="También sirve el teléfono o la placa."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      {carros === null && <Aviso tipo="buscando" titulo="Trayendo los carros…" />}

      {carros !== null && filtrados.length === 0 && (
        <div className="mt-6">
          <Vacio icono={SearchX} titulo="No encontramos ese carro">
            Pruebe con otro dato. Si el carro nunca ha venido, vuelva atrás y escoja «No, es la primera vez».
          </Vacio>
        </div>
      )}

      {filtrados.length > 0 && (
        <div className="mt-6 flex flex-col gap-3">
          {filtrados.slice(0, MAXIMO).map((c) => (
            <Eleccion
              key={c.id}
              icono={Car}
              titulo={c.cliente_nombre ?? "Sin dueño anotado"}
              ayuda={`${nombreCarro(c)} · ${c.placa.toUpperCase()}${c.trabajo_activo_id ? " · ya está en el taller" : ""}`}
              elegida={c.id === elegidoId}
              onClick={() => alElegir(c)}
            />
          ))}
          {filtrados.length > MAXIMO && (
            <p className="text-lg text-gris">
              Hay {filtrados.length - MAXIMO} carros más. Escriba el nombre del dueño para encontrarlo.
            </p>
          )}
        </div>
      )}
    </>
  );
}
