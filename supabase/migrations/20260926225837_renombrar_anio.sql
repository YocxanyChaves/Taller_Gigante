-- Fase 1: la ñ en nombres de columna da problemas en código y consultas
-- (hay que escribir "año" entre comillas). Confirmado por la dueña.

alter table public.vehiculos rename column "año" to anio;
