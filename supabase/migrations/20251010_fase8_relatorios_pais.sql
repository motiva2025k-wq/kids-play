-- FASE 8: Relatório Pais (RPC)

create or replace function public.relatorio_pais(child_id_param uuid, periodo text default 'semanal')
returns table (
  total_dias int,
  total_xp int,
  total_missoes int,
  taxa_acerto float,
  streak_atual int,
  streak_maior int,
  constancia jsonb
)
language plpgsql
security definer
as $$
begin
  return query
  select
    0::int as total_dias,
    coalesce(sum(xp), 0)::int as total_xp,
    coalesce(sum(total_missoes_concluidas), 0)::int as total_missoes,
    coalesce(avg(media_acertos), 0)::float as taxa_acerto,
    coalesce(min(streak_days), 0)::int as streak_atual,
    coalesce(max(streak_days), 0)::int as streak_maior,
    '{}'::jsonb as constancia
  from public.children
  where id = child_id_param;
end;
$$;
