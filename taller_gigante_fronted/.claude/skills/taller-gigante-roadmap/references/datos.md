# Modelo de datos nuevo

Ids existentes son `bigint` identity. Toda tabla nueva: RLS activo, `es_demo boolean not null default false` + trigger `enforce_es_demo_flag`, políticas admin (filas `es_demo=false`) y demo (filas `es_demo=true`) igual que las actuales. Nada para `anon` salvo las funciones públicas.

## Estados del trabajo (`ordenes.estado`)

| valor | texto en pantalla |
|---|---|
| `cita` | Cita agendada |
| `en_revision` | En revisión |
| `esperando_aprobacion` | Esperando respuesta del cliente |
| `no_aprobado` | No aprobó |
| `esperando_repuestos` | Esperando repuestos |
| `en_reparacion` | En reparación |
| `listo` | Listo para recoger |
| `entregado` | Entregado |
| `cancelado` | Cancelado |

Transiciones permitidas (validar en `avanzar_estado`):
cita→en_revision|cancelado · en_revision→esperando_aprobacion · esperando_aprobacion→esperando_repuestos|en_reparacion|no_aprobado · esperando_repuestos→en_reparacion · en_reparacion→listo · listo→entregado · no_aprobado→entregado (se lleva el carro). Admin puede corregir retrocediendo un paso con confirmación.

## Cambios en `ordenes`

Agregar: `problema_reportado text not null`, `fecha_cita timestamptz`, `km_entrada int`, `nivel_combustible text`, `notas_recepcion text`, `token_publico uuid not null default gen_random_uuid() unique`, `respondida_en timestamptz`, `aprobada boolean`, `comentario_cliente text`, `modalidad_pago text check (modalidad_pago in ('contado','cuotas'))`, `cobro_revision numeric(12,2)`.
`fecha_entrega timestamptz` nullable (se llena al pasar a `entregado`). Los campos viejos `costo_estimado`/`costo_final` se eliminan tras migrar (confirmar).

## Tablas nuevas

```sql
create table orden_items (
  id bigint generated always as identity primary key,
  orden_id bigint not null references ordenes(id) on delete cascade,
  tipo text not null check (tipo in ('repuesto','mano_obra','otro')),
  descripcion text not null,
  cantidad numeric(10,2) not null default 1 check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  costo_unitario numeric(12,2) check (costo_unitario >= 0), -- opcional: lo que le costó al taller
  subtotal numeric(12,2) generated always as (cantidad * precio_unitario) stored,
  es_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table pagos (
  id bigint generated always as identity primary key,
  orden_id bigint not null references ordenes(id) on delete cascade,
  monto numeric(12,2) not null check (monto > 0),
  metodo text not null check (metodo in ('efectivo','sinpe','tarjeta','transferencia')),
  nota text,
  pagado_en timestamptz not null default now(),
  es_demo boolean not null default false
);

create table orden_estados_historial (
  id bigint generated always as identity primary key,
  orden_id bigint not null references ordenes(id) on delete cascade,
  estado text not null,
  cambiado_por uuid references auth.users(id), -- null = lo cambió el cliente por el link
  created_at timestamptz not null default now(),
  es_demo boolean not null default false
);
```
Índices en todas las FKs y en `ordenes(estado)`, `pagos(pagado_en)`.

Vista `ordenes_totales` (security_invoker): `total` = suma subtotales (+ `cobro_revision` si no aprobado), `pagado` = suma pagos, `saldo` = total − pagado, `costo_repuestos`, `costo_completo` (false si algún repuesto no tiene costo).

## Link público (sin cuentas)

- `get_trabajo_publico(p_token uuid) returns json` — SECURITY DEFINER, `grant execute to anon`. Devuelve solo: nombre del taller, **nombre de pila** del cliente, marca/modelo/placa, estado + historial (fechas), problema, diagnóstico, ítems (sin costos del taller), total, pagado, saldo. **Nunca** teléfono, correo, dirección, costos ni otros trabajos. Token inexistente → null (mensaje amable, sin detalles).
- `responder_cotizacion(p_token uuid, p_aprueba boolean, p_comentario text default null)` — SECURITY DEFINER, anon. Solo si estado = `esperando_aprobacion`; guarda respuesta y pasa a `esperando_repuestos` (si hay algún ítem tipo repuesto) o `en_reparacion`, o a `no_aprobado`. Idempotente: si ya respondió, devuelve el estado actual.
- `regenerar_token(p_orden_id)` — solo admin.
- Tokens de trabajos `entregado` hace más de 60 días siguen funcionando solo para ver (no para responder).

## Cálculos del dashboard (`resumen_plata(desde date, hasta date)` → filas por mes)

- **Cobrado del mes:** suma de `pagos.monto` con `pagado_en` en el mes.
- **Por cobrar:** saldo pendiente hoy de los trabajos `entregado`/`no_aprobado`, agrupado por el mes de `fecha_entrega`.
- **Ganancia del mes:** para trabajos entregados en el mes: total − costo de repuestos. Marcar `aproximada = true` si algún repuesto no tiene `costo_unitario`.
- Tarjetas de Inicio: carros en el taller (estados `en_revision`..`listo`), esperando respuesta, listos para recoger, total por cobrar.
Todo filtrado por `es_demo` según el rol.
