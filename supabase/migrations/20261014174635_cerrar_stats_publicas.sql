-- get_stats_publicas() dejaba que cualquiera, sin iniciar sesión, viera
-- cuántos clientes, carros y trabajos entregados tiene el taller. La app ya no
-- la usa: se le quita el permiso a todos (queda solo para el dueño de la base).

revoke execute on function public.get_stats_publicas() from public, anon, authenticated;
