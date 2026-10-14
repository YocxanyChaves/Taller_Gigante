-- El link del cliente (/t/<token>) vence 30 días después de entregar el
-- carro, si ya no debe nada. Mientras deba plata sigue abierto, para que vea
-- cuánto le falta. Vencido, solo devuelve {"vencido": true}: ni nombre, ni
-- placa, ni precios. Un token que no existe sigue devolviendo null.

create or replace function public.get_trabajo_publico(p_token uuid)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select case
    when o.estado = 'entregado'
      and t.saldo <= 0
      and o.fecha_entrega < now() - interval '30 days'
    then json_build_object('vencido', true)
    else json_build_object(
      'taller', 'Taller Mecánico Gigante',
      'cliente', nullif(split_part(trim(c.nombre), ' ', 1), ''),
      'carro', json_build_object('marca', v.marca, 'modelo', v.modelo, 'placa', v.placa),
      'estado', o.estado,
      'historial', (
        select json_agg(json_build_object('estado', h.estado, 'fecha', h.created_at) order by h.created_at, h.id)
        from public.orden_estados_historial h
        where h.orden_id = o.id
      ),
      'problema', o.problema_reportado,
      'diagnostico', o.diagnostico,
      'fecha_cita', o.fecha_cita,
      'fecha_ingreso', o.fecha_ingreso,
      'fecha_entrega', o.fecha_entrega,
      'items', (
        select json_agg(json_build_object(
          'tipo', i.tipo,
          'descripcion', i.descripcion,
          'cantidad', i.cantidad,
          'precio_unitario', i.precio_unitario,
          'subtotal', i.subtotal
        ) order by i.id)
        from public.orden_items i
        where i.orden_id = o.id
      ),
      'aprobada', o.aprobada,
      'cobro_revision', o.cobro_revision,
      'total', t.total,
      'pagado', t.pagado,
      'saldo', t.saldo,
      'puede_responder', o.estado = 'esperando_aprobacion'
    )
  end
  from public.ordenes o
  join public.vehiculos v on v.id = o.id_vehiculo
  left join public.clientes c on c.id = v.id_cliente
  join public.ordenes_totales t on t.orden_id = o.id
  where o.token_publico = p_token;
$$;
