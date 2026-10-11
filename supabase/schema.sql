-- =========================================================
-- Kids_Play — FASE 1 — Banco de dados completo
-- =========================================================
-- COMO USAR (passo a passo):
-- 1. Crie o projeto em https://supabase.com (plano gratuito)
-- 2. No painel do Supabase: "SQL Editor" → "New query"
-- 3. Cole ESTE arquivo inteiro e clique em "Run" (▶)
-- 4. Pronto: tabelas, proteções (RLS) e a pasta privada de fotos criadas.
--
-- IMPORTANTE: "RLS" (Row Level Security) são as regras de segurança.
-- Resumo: cada responsável SÓ enxerga os dados dos próprios filhos.
-- =========================================================

-- ---------------------------------------------------------
-- 1) TABELA: perfis das crianças
-- ---------------------------------------------------------
create table if not exists public.children (
  id               uuid primary key default gen_random_uuid(),
  guardian_id      uuid not null references auth.users (id) on delete cascade,
  nickname         text not null check (char_length(nickname) between 2 and 20),
  school_year      text not null check (school_year in ('2', '3', '4')),
  avatar_id        text not null default 'estrela',
  -- Foto opcional: caminho da imagem dentro do bucket PRIVADO 'avatars'
  photo_path       text,
  -- Consentimento do responsável (LGPD / ECA Digital)
  photo_consent    boolean not null default false,
  ranking_consent  boolean not null default true,
  -- Gamificação (será usada a partir da FASE 4)
  xp               integer not null default 0,
  coins            integer not null default 0,
  stage            text not null default 'aldeia'
                   check (stage in ('aldeia', 'vila', 'castelo', 'reino')),
  streak_days      integer not null default 0,
  last_active_date date,
  created_at       timestamptz not null default now()
);

-- Acelera a busca "crianças do responsável X"
create index if not exists children_guardian_id_idx
  on public.children (guardian_id);

-- ---------------------------------------------------------
-- 2) TABELA: registro de consentimentos (auditoria LGPD)
-- Cada ligar/desligar de foto ou ranking fica guardado aqui
-- com data e hora, para prova de que o responsável autorizou.
-- ---------------------------------------------------------
create table if not exists public.guardian_consents (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references public.children (id) on delete cascade,
  consent_type  text not null check (consent_type in ('photo', 'ranking')),
  granted       boolean not null,
  granted_at    timestamptz not null default now()
);

create index if not exists guardian_consents_child_id_idx
  on public.guardian_consents (child_id);

-- =========================================================
-- 3) SEGURANÇA (RLS) — ativar em todas as tabelas
-- Sem RLS ativo + regras, NINGUÉM poderia ler (nem o app).
-- =========================================================
alter table public.children enable row level security;
alter table public.guardian_consents enable row level security;

-- --- Regras da tabela children ---
-- (recriar sem erro caso você rode o arquivo de novo)
drop policy if exists "children_select_own" on public.children;
create policy "children_select_own"
  on public.children for select
  using (auth.uid() = guardian_id);

drop policy if exists "children_insert_own" on public.children;
create policy "children_insert_own"
  on public.children for insert
  with check (auth.uid() = guardian_id);

drop policy if exists "children_update_own" on public.children;
create policy "children_update_own"
  on public.children for update
  using (auth.uid() = guardian_id)
  with check (auth.uid() = guardian_id);

drop policy if exists "children_delete_own" on public.children;
create policy "children_delete_own"
  on public.children for delete
  using (auth.uid() = guardian_id);

-- --- Regras da tabela guardian_consents ---
-- O responsável só mexe nos consentimentos dos próprios filhos.
drop policy if exists "consents_select_own" on public.guardian_consents;
create policy "consents_select_own"
  on public.guardian_consents for select
  using (exists (
    select 1 from public.children c
    where c.id = guardian_consents.child_id
      and c.guardian_id = auth.uid()
  ));

drop policy if exists "consents_insert_own" on public.guardian_consents;
create policy "consents_insert_own"
  on public.guardian_consents for insert
  with check (exists (
    select 1 from public.children c
    where c.id = guardian_consents.child_id
      and c.guardian_id = auth.uid()
  ));

-- =========================================================
-- 4) STORAGE — pasta privada das fotos de perfil
-- 'public = false' significa: ninguém acessa a foto pela internet
-- sem estar logado E ser o dono do perfil.
-- =========================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

-- Regra do storage: a foto de cada criança fica na pasta
-- "id-da-crianca/foto.png". Só o responsável dono acessa.
drop policy if exists "avatars_owner_all" on storage.objects;
create policy "avatars_owner_all"
  on storage.objects for all
  using (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.children c
      where c.id::text = (storage.foldername(name))[1]
        and c.guardian_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'avatars'
    and exists (
      select 1 from public.children c
      where c.id::text = (storage.foldername(name))[1]
        and c.guardian_id = auth.uid()
    )
  );
