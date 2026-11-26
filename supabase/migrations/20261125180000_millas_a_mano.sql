-- Millas anotadas a mano al recibir un carro.
-- Al recibir se piden kilómetros y, debajo, millas: una sale de la otra con la
-- fórmula, pero a veces el tablero no cuadra con la conversión y el taller la
-- corrige a mano. km_entrada + unidad_distancia siguen siendo la lectura
-- principal (sin cambios); millas_entrada solo se llena cuando las millas se
-- escribieron aparte y hay que mostrarlas tal cual. Vacía = se calculan.
-- Las políticas de `ordenes` (RLS) ya cubren la columna nueva.

alter table public.ordenes
  add column millas_entrada integer check (millas_entrada >= 0);
