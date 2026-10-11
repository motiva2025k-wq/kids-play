-- FASE 6: Loja + Inventário

create table if not exists public.loja_itens (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  preco int not null check (preco >= 0),
  tipo text not null check (tipo in ('avatar', 'borda', 'tema')),
  ativo boolean not null default true,
  unico boolean not null default false,
  dados jsonb default '{}',
  criado_em timestamptz not null default now()
);

create table if not exists public.inventario (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  item_id uuid not null references public.loja_itens (id) on delete cascade,
  equipado boolean not null default false,
  adquirido_em timestamptz not null default now(),
  unique (child_id, item_id)
);

-- Adicionar campos de equipamento ao children
alter table public.children
  add column if not exists avatar_equipado text,
  add column if not exists borda_equipada text,
  add column if not exists tema_equipado text;

alter table public.loja_itens enable row level security;
alter table public.inventario enable row level security;

create policy "loja_read" on public.loja_itens for select using (true);
create policy "inventario_read_own" on public.inventario for select using (exists (select 1 from public.children c where c.id=inventario.child_id and c.guardian_id=auth.uid()));
create policy "inventario_write_own" on public.inventario for all using (exists (select 1 from public.children c where c.id=inventario.child_id and c.guardian_id=auth.uid())) with check (exists (select 1 from public.children c where c.id=inventario.child_id and c.guardian_id=auth.uid()));

-- Função comprar_item
create or replace function public.comprar_item(child_id_param uuid, item_id_param uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  item_preco int;
  child_coins int;
  item_unico boolean;
  ja_tem boolean;
  item_nome text;
begin
  -- Obter dados do item
  select preco, unico, nome into item_preco, item_unico, item_nome
  from public.loja_itens
  where id = item_id_param and ativo = true;
  
  if not found then
    raise exception 'Item não encontrado ou inativo';
  end if;
  
  -- Verificar se já possui (se for único)
  if item_unico then
    select exists(select 1 from public.inventario where child_id = child_id_param and item_id = item_id_param) into ja_tem;
    if ja_tem then
      raise exception 'Item já adquirido';
    end if;
  end if;
  
  -- Verificar moedas
  select coins into child_coins from public.children where id = child_id_param;
  if child_coins < item_preco then
    raise exception 'Moedas insuficientes';
  end if;
  
  -- Debitar moedas
  update public.children set coins = coins - item_preco where id = child_id_param;
  
  -- Adicionar ao inventário
  insert into public.inventario (child_id, item_id)
  values (child_id_param, item_id_param)
  on conflict (child_id, item_id) do nothing;
  
  return jsonb_build_object('sucesso', true, 'item', item_nome);
end;
$$;
