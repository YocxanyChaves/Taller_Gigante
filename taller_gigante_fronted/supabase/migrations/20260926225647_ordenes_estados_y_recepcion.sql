-- Fase 1: órdenes con el flujo real del taller.
--
-- En la interfaz las órdenes se llaman "trabajos". Estados nuevos, datos de la
-- cita y la recepción, link público y respuesta del cliente.

-- ===== ESTADOS =====
-- Los viejos pasan a los nuevos (confirmado por la dueña).

update public.ordenes
set estado = case estado
  when 'Pendiente'  then 'en_revision'
  when 'En proceso' then 'en_reparacion'
  when 'Completado' then 'entregado'
  else estado
end;

alter table public.ordenes
  add constraint ordenes_estado_valido check (estado in (
    'cita', 'en_revision', 'esperando_aprobacion', 'no_aprobado',
    'esperando_repuestos', 'en_reparacion', 'listo', 'entregado', 'cancelado'
  )),
  alter column estado set default 'en_revision';

create index idx_ordenes_estado on public.ordenes (estado);

-- ===== FECHA DE ENTREGA =====
-- Solo la tienen los entregados. Los entregados viejos sin fecha toman la de
-- ingreso, para que cuenten en el mes correcto del dashboard.

update public.ordenes set fecha_entrega = null where estado <> 'entregado';
update public.ordenes set fecha_entrega = fecha_ingreso
where estado = 'entregado' and fecha_entrega is null;

-- ===== PROBLEMA REPORTADO =====
-- La "descripción" vieja es lo que el cliente dijo que le pasaba al carro.

alter table public.ordenes rename column descripcion to problema_reportado;
update public.ordenes set problema_reportado = 'Sin descripción'
where coalesce(trim(problema_reportado), '') = '';
alter table public.ordenes alter column problema_reportado set not null;

-- ===== CITA, RECEPCIÓN, LINK Y RESPUESTA DEL CLIENTE =====

alter table public.ordenes
  add column fecha_cita timestamptz,
  add column km_entrada integer check (km_entrada >= 0),
  add column nivel_combustible text
    check (nivel_combustible in ('vacio', '1/4', '1/2', '3/4', 'lleno')),
  add column notas_recepcion text,
  add column token_publico uuid not null default gen_random_uuid() unique,
  add column aprobada boolean,
  add column respondida_en timestamptz,
  add column comentario_cliente text check (char_length(comentario_cliente) <= 500),
  add column modalidad_pago text check (modalidad_pago in ('contado', 'cuotas')),
  -- opcional: lo que se cobra por revisar cuando el cliente no aprueba
  add column cobro_revision numeric(12, 2) check (cobro_revision >= 0);
