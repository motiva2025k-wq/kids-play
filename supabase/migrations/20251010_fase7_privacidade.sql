-- FASE 7: Privacidade, consentimento e painel dos pais

-- Tabela de consentimentos detalhados
create table if not exists public.consentimentos (
  id uuid primary key default gen_random_uuid(),
  responsavel_id uuid not null references auth.users(id) on delete cascade,
  crianca_id uuid references public.children(id) on delete cascade,
  tipo text not null check (tipo in ('tratamento_dados', 'ranking', 'foto_ranking', 'resumo_email')),
  aceito boolean not null,
  versao_texto text,
  criado_em timestamptz not null default now(),
  revogado_em timestamptz
);

-- Medalhas obtidas
create table if not exists public.medalhas_obtidas (
  id uuid primary key default gen_random_uuid(),
  crianca_id uuid not null,
  medalha_id text,
  nome text,
  descricao text,
  obtida_em timestamptz not null default now()
);
alter table public.medalhas_obtidas enable row level security;
create policy "medalhas_read_own" on public.medalhas_obtidas for select using (crianca_id = auth.uid());
create policy "medalhas_write_own" on public.medalhas_obtidas for all using (crianca_id = auth.uid()) with check (crianca_id = auth.uid());

-- Adicionar campos extras ao children para privacidade
alter table public.children
  add column if not exists foto_url_assinada text,
  add column if not exists resumo_email_consent boolean default false,
  add column if not exists excluido_em timestamptz,
  add column if not exists anonimo boolean default false;

-- Habilitar RLS
alter table public.consentimentos enable row level security;

-- Políticas
create policy "consentimentos_read_own" on public.consentimentos
  for select using (responsavel_id = auth.uid());
create policy "consentimentos_insert_own" on public.consentimentos
  for insert with check (responsavel_id = auth.uid());
create policy "consentimentos_update_own" on public.consentimentos
  for update using (responsavel_id = auth.uid());

-- Função exportar dados
create or replace function public.exportar_dados(crianca_id_param uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  result jsonb;
begin
  -- Verificar se é responsável da criança
  if not exists (select 1 from public.children where id = crianca_id_param and guardian_id = auth.uid()) then
    raise exception 'Acesso negado';
  end if;
  
  select jsonb_build_object(
    'perfil', (select to_jsonb(c) from public.children c where c.id = crianca_id_param),
    'tentativas', (select coalesce(jsonb_agg(t), '[]'::jsonb) from public.tentativas_missao t where t.crianca_id = crianca_id_param),
    'respostas', (select coalesce(jsonb_agg(r), '[]'::jsonb) from public.respostas r 
                  join public.tentativas_missao t on t.id = r.tentativa_id 
                  where t.crianca_id = crianca_id_param),
    'medalhas', (select coalesce(jsonb_agg(m), '[]'::jsonb) from public.medalhas_obtidas m where m.crianca_id = crianca_id_param),
    'inventario', (select coalesce(jsonb_agg(i), '[]'::jsonb) from public.inventario i where i.child_id = crianca_id_param),
    'consentimentos', (select coalesce(jsonb_agg(cs), '[]'::jsonb) from public.consentimentos cs where cs.crianca_id = crianca_id_param)
  ) into result;
  
  return result;
end;
$$;

-- Função excluir criança
create or replace function public.excluir_crianca(crianca_id_param uuid, confirmacao text default '')
returns jsonb
language plpgsql
security definer
as $$
begin
  if confirmacao != 'EXCLUIR' then
    raise exception 'Confirmação necessária: digite EXCLUIR';
  end if;
  if not exists (select 1 from public.children where id = crianca_id_param and guardian_id = auth.uid()) then
    raise exception 'Acesso negado';
  end if;
  -- Marcar como excluído/anônimo (preserva integridade referencial ao anonimizar em rankings)
  update public.children set excluido_em = now(), anonimo = true, nickname = 'Explorador anônimo', photo_path = null where id = crianca_id_param;
  delete from public.inventario where child_id = crianca_id_param;
  delete from public.tentativas_missao where crianca_id = crianca_id_param;
  delete from public.medalhas_obtidas where crianca_id = crianca_id_param;
  return jsonb_build_object('sucesso', true);
end;
$$;

-- Função excluir conta (simplificada)
create or replace function public.excluir_conta(confirmacao text default '')
returns jsonb
language plpgsql
security definer
as $$
begin
  if confirmacao != 'EXCLUIR' then
    raise exception 'Confirmação necessária: digite EXCLUIR';
  end if;
  -- Remove dados relacionados ao usuário atual
  delete from public.children where guardian_id = auth.uid();
  return jsonb_build_object('sucesso', true);
end;
$$;
