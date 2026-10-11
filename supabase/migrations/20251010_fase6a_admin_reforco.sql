-- FASE 6 (parte A): Admin importação, revisão e Modo Reforço

-- Adicionar metadados às tabelas existentes
alter table public.missoes
  add column if not exists habilidade_bncc text,
  add column if not exists tema text,
  add column if not exists status_revisao text check (status_revisao in ('rascunho', 'revisada', 'aprovada')) default 'rascunho',
  add column if not exists revisada_por text,
  add column if not exists revisada_em timestamptz;

alter table public.perguntas
  add column if not exists status_revisao text check (status_revisao in ('rascunho', 'revisada', 'aprovada')) default 'rascunho',
  add column if not exists origem text check (origem in ('ia', 'manual')) default 'manual',
  add column if not exists lote_id text;

-- Tabela lotes_importacao
create table if not exists public.lotes_importacao (
  id bigserial primary key,
  lote_id text not null,
  ano int,
  materia text,
  tema text,
  qtd_perguntas int,
  importado_em timestamptz not null default now(),
  observacoes text,
  unique (lote_id)
);

-- Tabela revisao_perguntas (espaçamento reforço)
create table if not exists public.revisao_perguntas (
  id bigserial primary key,
  crianca_id uuid not null,
  pergunta_id bigint not null references public.perguntas(id) on delete cascade,
  proxima_revisao date not null default now(),
  acertos_seguidos int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (crianca_id, pergunta_id)
);

-- Tabela relatos_erro
create table if not exists public.relatos_erro (
  id bigserial primary key,
  pergunta_id bigint not null references public.perguntas(id) on delete cascade,
  texto text not null,
  criado_em timestamptz not null default now()
);

-- Habilitar RLS
alter table public.lotes_importacao enable row level security;
alter table public.revisao_perguntas enable row level security;
alter table public.relatos_erro enable row level security;

-- Políticas: apenas admin (via service role) ou leitura controlada
-- Para simplicidade no app, mantemos leitura autenticada; operações admin via service role bypassa RLS
create policy "lotes_read_auth" on public.lotes_importacao for select using (auth.role() = 'authenticated');
create policy "revisao_read_own" on public.revisao_perguntas for select using (crianca_id = auth.uid());
create policy "revisao_write_own" on public.revisao_perguntas for all using (crianca_id = auth.uid()) with check (crianca_id = auth.uid());
create policy "relatos_read_auth" on public.relatos_erro for select using (auth.role() = 'authenticated');
create policy "relatos_insert_auth" on public.relatos_erro for insert with check (auth.role() = 'authenticated');

-- Atualizar políticas de missoes/perguntas para só mostrar aprovadas para crianças
-- (admin via service role vê tudo)
-- Mantemos políticas existentes mas documentamos: app deve filtrar por status_revisao = 'aprovada' para crianças
-- Função gerar_reforco (stub inicial - será chamada pelo backend/app)
create or replace function public.gerar_reforco(child_id_param uuid, materia_id_param text default null)
returns table (
  pergunta_id bigint,
  missao_id bigint,
  tipo text,
  enunciado text,
  dados jsonb,
  dica text,
  explicacao text
)
language plpgsql
security definer
as $$
begin
  -- Retorna perguntas aprovadas aleatórias por padrão (implementação simplificada)
  return query
  select p.id as pergunta_id, p.missao_id, p.tipo, p.enunciado, p.dados, p.dica, p.explicacao
  from public.perguntas p
  join public.missoes m on m.id = p.missao_id
  where m.status_revisao = 'aprovada' and p.status_revisao = 'aprovada'
    and (materia_id_param is null or m.materia_id = materia_id_param)
  order by random()
  limit 6;
end;
$$;
