-- FASE 5: Ranking, Ligas, Hall da Fama, Troféus, RPCs

-- Tabela de ranks/ligas
create table if not exists public.ranks (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  periodo text not null check (periodo in ('semanal', 'mensal', 'global')),
  ano int not null,
  semana int,
  mes int,
  xp_total int not null default 0,
  posicao int,
  liga text,
  criado_em timestamptz not null default now(),
  unique (child_id, periodo, ano, semana, mes)
);

-- Ligas
create table if not exists public.ligas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  min_xp int not null,
  max_xp int,
  icone text
);

-- Hall da Fama
create table if not exists public.hall_da_fama (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  periodo text not null,
  ano int not null,
  posicao int not null,
  xp_total int not null,
  criado_em timestamptz not null default now()
);

-- Troféus de Esforço
create table if not exists public.trofeus_esforco (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  tipo text not null,
  descricao text,
  concedido_em timestamptz not null default now()
);

-- Primeiro Trono
create table if not exists public.primeiro_trono (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  periodo text not null,
  ano int not null,
  concedido_em timestamptz not null default now(),
  unique (child_id, periodo, ano)
);

-- Adicionar campos ao children se necessário
alter table public.children
  add column if not exists mostrar_no_ranking boolean default true,
  add column if not exists mostrar_foto_no_ranking boolean default false,
  add column if not exists total_missoes_concluidas int default 0,
  add column if not exists media_acertos float default 0,
  add column if not exists nivel int default 1;

-- Habilitar RLS
alter table public.ranks enable row level security;
alter table public.ligas enable row level security;
alter table public.hall_da_fama enable row level security;
alter table public.trofeus_esforco enable row level security;
alter table public.primeiro_trono enable row level security;

-- Políticas básicas (visibilidade controlada)
create policy if not exists "ranks_read" on public.ranks for select using (true);
create policy if not exists "ligas_read" on public.ligas for select using (true);
create policy if not exists "hall_read" on public.hall_da_fama for select using (true);
create policy if not exists "trofeus_read_own" on public.trofeus_esforco for select using (exists (select 1 from public.children c where c.id=trofeus_esforco.child_id and c.guardian_id=auth.uid()));
create policy if not exists "primeiro_trono_read" on public.primeiro_trono for select using (true);
