-- Arreglos urgentes de seguridad (hoja de ruta, sección A).
--
-- A1. El rol de un registro nuevo se tomaba de raw_user_meta_data->>'rol',
--     que controla quien se registra: cualquiera podía crearse como admin.
--     Ahora todo registro nuevo es 'cliente'. Los roles admin/demo solo los
--     asigna un admin desde la página Usuarios (o por SQL directo).
--
-- A2. La cuenta nueva se vinculaba sola a una ficha existente si coincidía
--     el teléfono (que no se verifica) o el correo (antes de confirmarlo).
--     Alguien que supiera el teléfono de un cliente podía ver sus datos.
--     Ahora ya no se usa el teléfono, y el correo solo cuenta si viene
--     verificado por un proveedor OAuth (Google, etc.). En los demás casos
--     se crea una ficha nueva y el admin la vincula/fusiona a mano.
--
-- A3. proteger_rol_usuario dejaba pasar el cambio si get_my_role() era NULL
--     (NULL <> 'admin' da NULL, no true). Ahora se trata NULL como "no admin".
--     Los cambios hechos directo en la base (SQL editor, migraciones), que no
--     traen JWT, y los del service_role siguen permitidos.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_telefono text;
  v_cliente_id bigint;
  v_nombre text;
  v_correo_verificado boolean;
begin
  v_nombre := coalesce(
    new.raw_user_meta_data->>'nombre',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    ''
  );

  -- A1: nunca se toma el rol de la metadata del registro.
  insert into public.usuarios (id, nombre, correo, rol)
  values (new.id, v_nombre, new.email, 'cliente');

  v_telefono := coalesce(new.raw_user_meta_data->>'telefono', '');

  -- A2: solo se confía en el correo cuando lo verificó un proveedor OAuth.
  v_correo_verificado :=
    new.email_confirmed_at is not null
    and coalesce(new.raw_app_meta_data->>'provider', 'email') <> 'email';

  if v_correo_verificado then
    select id into v_cliente_id
    from public.clientes
    where user_id is null
      and es_demo = false
      and correo is not null
      and lower(correo) = lower(new.email)
    order by fecha_ingreso desc
    limit 1;
  end if;

  if v_cliente_id is not null then
    -- ya existía una ficha (creada por el admin) con ese mismo correo
    -- verificado: se vincula directamente.
    update public.clientes set user_id = new.id where id = v_cliente_id;
  else
    -- se crea una ficha nueva para que la persona aparezca en Clientes;
    -- si el taller ya tenía una ficha suya, el admin las fusiona.
    insert into public.clientes (nombre, correo, telefono, user_id, es_demo)
    values (v_nombre, new.email, v_telefono, new.id, false);
  end if;

  return new;
end;
$function$;

create or replace function public.proteger_rol_usuario()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.rol is distinct from old.rol
     -- viene de la API (con JWT), no de una conexión directa a la base
     and nullif(current_setting('request.jwt.claims', true), '') is not null
     and coalesce(auth.jwt()->>'role', '') <> 'service_role'
     and coalesce(public.get_my_role(), '') <> 'admin' then
    raise exception 'No tienes permiso para cambiar el rol de este usuario.';
  end if;
  return new;
end;
$function$;
