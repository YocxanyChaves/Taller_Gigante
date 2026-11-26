-- Bitácora: quién cambió qué y cuándo.
-- Cada vez que se crea, cambia o borra un cliente, un carro, un trabajo, un
-- cobro del precio, un pago o una foto, un trigger anota un renglón aquí. Se
-- guarda solo lo que cambió (antes → después), quién lo hizo (o «el cliente,
-- desde su link» si no hay sesión) y de qué carro o cliente se trata, para
-- poder leerlo sin buscar.
--
-- Solo la llenan los triggers: desde la app se puede leer pero nunca
-- escribir, cambiar ni borrar (no hay políticas de insert/update/delete).
-- El demo ve solo su bitácora (es_demo sale del renglón que se cambió).

create table public.bitacora (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  usuario_id uuid,
  quien text not null,
  tabla text not null,
  registro_id bigint,
  accion text not null check (accion in ('crear', 'cambiar', 'borrar')),
  orden_id bigint,
  cliente_id bigint,
  que text,
  cambios jsonb not null default '{}'::jsonb,
  es_demo boolean not null default false
);

create index bitacora_creado_en_idx on public.bitacora (es_demo, creado_en desc);
create index bitacora_orden_idx on public.bitacora (orden_id);
create index bitacora_cliente_idx on public.bitacora (cliente_id);

alter table public.bitacora enable row level security;

create policy bitacora_select on public.bitacora
  for select to authenticated
  using (
    ((select public.get_my_role()) = 'admin' and es_demo = false)
    or ((select public.get_my_role()) = 'demo' and es_demo = true)
  );

-- Columnas que no vale la pena anotar (se calculan solas o son internas).
create or replace function public.bitacora_ignorar(p_tabla text, p_campo text)
returns boolean
language sql
immutable
set search_path = public
as $$
  select p_campo in ('id', 'es_demo', 'created_at', 'subtotal', 'token_publico')
      or (p_tabla = 'orden_fotos' and p_campo = 'ruta');
$$;

create or replace function public.registrar_bitacora()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nuevo jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_viejo jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_fila jsonb := coalesce(v_nuevo, v_viejo);
  v_cambios jsonb := '{}'::jsonb;
  v_campo text;
  v_quien text;
  v_orden_id bigint;
  v_vehiculo_id bigint;
  v_cliente_id bigint;
  v_que text;
begin
  -- Qué cambió.
  if tg_op = 'UPDATE' then
    for v_campo in select jsonb_object_keys(v_nuevo) loop
      if not public.bitacora_ignorar(tg_table_name, v_campo)
         and (v_nuevo -> v_campo) is distinct from (v_viejo -> v_campo) then
        v_cambios := v_cambios || jsonb_build_object(
          v_campo, jsonb_build_object('antes', v_viejo -> v_campo, 'despues', v_nuevo -> v_campo)
        );
      end if;
    end loop;
    if v_cambios = '{}'::jsonb then
      return null; -- no cambió nada que importe
    end if;
  else
    for v_campo in select jsonb_object_keys(v_fila) loop
      if not public.bitacora_ignorar(tg_table_name, v_campo) and (v_fila -> v_campo) <> 'null'::jsonb then
        v_cambios := v_cambios || jsonb_build_object(
          v_campo,
          case when tg_op = 'INSERT'
            then jsonb_build_object('despues', v_fila -> v_campo)
            else jsonb_build_object('antes', v_fila -> v_campo)
          end
        );
      end if;
    end loop;
  end if;

  -- Quién.
  if auth.uid() is null then
    v_quien := 'El cliente, desde su link';
  else
    select coalesce(nullif(trim(nombre), ''), correo, 'Alguien del taller')
      into v_quien from public.usuarios where id = auth.uid();
    v_quien := coalesce(v_quien, 'Alguien del taller');
  end if;

  -- De qué carro o cliente se trata.
  if tg_table_name = 'clientes' then
    v_cliente_id := (v_fila ->> 'id')::bigint;
    v_que := v_fila ->> 'nombre';
  elsif tg_table_name = 'vehiculos' then
    v_vehiculo_id := (v_fila ->> 'id')::bigint;
    v_cliente_id := (v_fila ->> 'id_cliente')::bigint;
  elsif tg_table_name = 'ordenes' then
    v_orden_id := (v_fila ->> 'id')::bigint;
    v_vehiculo_id := (v_fila ->> 'id_vehiculo')::bigint;
  else
    v_orden_id := (v_fila ->> 'orden_id')::bigint;
    select id_vehiculo into v_vehiculo_id from public.ordenes where id = v_orden_id;
  end if;

  if v_vehiculo_id is not null then
    select
      trim(concat_ws(' ', v.marca, v.modelo, upper(v.placa))),
      coalesce(v_cliente_id, v.id_cliente)
      into v_que, v_cliente_id
      from public.vehiculos v where v.id = v_vehiculo_id;
    if v_que is null and tg_table_name = 'vehiculos' then
      v_que := trim(concat_ws(' ', v_fila ->> 'marca', v_fila ->> 'modelo', upper(v_fila ->> 'placa')));
    end if;
  end if;

  insert into public.bitacora (
    usuario_id, quien, tabla, registro_id, accion, orden_id, cliente_id, que, cambios, es_demo
  ) values (
    auth.uid(),
    v_quien,
    tg_table_name,
    (v_fila ->> 'id')::bigint,
    case tg_op when 'INSERT' then 'crear' when 'UPDATE' then 'cambiar' else 'borrar' end,
    v_orden_id,
    v_cliente_id,
    nullif(v_que, ''),
    v_cambios,
    coalesce((v_fila ->> 'es_demo')::boolean, false)
  );
  return null;
end;
$$;

revoke all on function public.registrar_bitacora() from public, anon, authenticated;

create trigger bitacora_clientes after insert or update or delete on public.clientes
  for each row execute function public.registrar_bitacora();
create trigger bitacora_vehiculos after insert or update or delete on public.vehiculos
  for each row execute function public.registrar_bitacora();
create trigger bitacora_ordenes after insert or update or delete on public.ordenes
  for each row execute function public.registrar_bitacora();
create trigger bitacora_orden_items after insert or update or delete on public.orden_items
  for each row execute function public.registrar_bitacora();
create trigger bitacora_pagos after insert or update or delete on public.pagos
  for each row execute function public.registrar_bitacora();
create trigger bitacora_orden_fotos after insert or update or delete on public.orden_fotos
  for each row execute function public.registrar_bitacora();
