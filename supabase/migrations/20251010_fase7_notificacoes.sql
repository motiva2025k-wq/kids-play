-- FASE 7: Notificações lidas

create table if not exists public.notificacoes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  tipo text not null,
  titulo text not null,
  mensagem text,
  dados jsonb default '{}',
  lida boolean not null default false,
  criado_em timestamptz not null default now()
);

create table if not exists public.notificacoes_lidas (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  notificacao_id uuid not null references public.notificacoes (id) on delete cascade,
  lida_em timestamptz not null default now(),
  unique (child_id, notificacao_id)
);

alter table public.notificacoes enable row level security;
alter table public.notificacoes_lidas enable row level security;

create policy "notif_read_own" on public.notificacoes for select using (exists (select 1 from public.children c where c.id=notificacoes.child_id and c.guardian_id=auth.uid()));
create policy "notif_lidas_own" on public.notificacoes_lidas for all using (exists (select 1 from public.children c where c.id=notificacoes_lidas.child_id and c.guardian_id=auth.uid())) with check (exists (select 1 from public.children c where c.id=notificacoes_lidas.child_id and c.guardian_id=auth.uid()));
