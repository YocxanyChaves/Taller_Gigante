-- Calidad de datos y tipos (hoja de ruta, sección C, parte de la fase 0).
--
-- Los datos actuales son de prueba (confirmado por la dueña el 26/09/2026),
-- así que la limpieza se hace con criterio y sin marcar valores para revisión.

-- ===== LIMPIEZA PREVIA =====

-- Placa DSF-456 repetida (dos vehículos de "juan", sin órdenes): se queda el
-- Toyota Hilux y se borra el Honda.
delete from public.vehiculos
where upper(regexp_replace(placa, '[^A-Za-z0-9]', '', 'g')) = 'DSF456'
  and marca = 'Honda'
  and not exists (select 1 from public.ordenes o where o.id_vehiculo = vehiculos.id);

-- ===== ÓRDENES: COSTOS =====
-- De texto a número. Se quita todo lo que no sea dígito, así que el punto se
-- toma como separador de miles ("20.222" -> 20222, formato tico) y "" -> null.

alter table public.ordenes
  alter column costo_final drop not null;

alter table public.ordenes
  alter column costo_estimado type numeric(12, 2)
    using nullif(regexp_replace(costo_estimado, '[^0-9]', '', 'g'), '')::numeric,
  alter column costo_final type numeric(12, 2)
    using nullif(regexp_replace(costo_final, '[^0-9]', '', 'g'), '')::numeric;

alter table public.ordenes
  add constraint ordenes_costo_estimado_positivo check (costo_estimado >= 0),
  add constraint ordenes_costo_final_positivo check (costo_final >= 0);

-- ===== ÓRDENES: FECHA DE ENTREGA =====
-- Era obligatoria y sin zona horaria: obligaba a inventar una fecha para
-- carros que no se han entregado. Ahora es opcional y con zona horaria (las
-- fechas viejas se interpretan en hora de Costa Rica).

alter table public.ordenes
  alter column fecha_entrega drop not null,
  alter column fecha_entrega type timestamptz
    using fecha_entrega at time zone 'America/Costa_Rica';

-- Las órdenes que no están completadas no se han entregado.
update public.ordenes set fecha_entrega = null where estado <> 'Completado';

-- ===== VEHÍCULOS: KILOMETRAJE =====
-- De texto ("20.000KM", "45000 km") a número entero.

alter table public.vehiculos
  alter column kilometraje type integer
    using nullif(regexp_replace(kilometraje, '[^0-9]', '', 'g'), '')::integer;

alter table public.vehiculos
  add constraint vehiculos_kilometraje_positivo check (kilometraje >= 0);

-- ===== VEHÍCULOS: PLACA ÚNICA =====
-- Sin importar mayúsculas, guiones ni espacios ("dsf-456" = "DSF 456").
-- Solo entre vehículos reales: el demo puede repetir placas de ejemplo.

create unique index vehiculos_placa_unica
  on public.vehiculos (upper(regexp_replace(placa, '[^A-Za-z0-9]', '', 'g')))
  where es_demo = false;
