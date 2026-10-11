-- FASE 6b: Função equipar_item

create or replace function public.equipar_item(child_id_param uuid, item_id_param uuid)
returns void
language plpgsql
security definer
as $$
declare
  item_tipo text;
begin
  -- Verifica se item está no inventário
  select tipo into item_tipo from public.loja_itens li
  join public.inventario inv on inv.item_id = li.id
  where inv.child_id = child_id_param and inv.item_id = item_id_param;
  
  if item_tipo is null then
    raise exception 'Item não encontrado no inventário';
  end if;
  
  -- Desequipa itens do mesmo tipo
  update public.inventario inv
  set equipado = false
  from public.loja_itens li
  where inv.item_id = li.id
  and inv.child_id = child_id_param
  and li.tipo = item_tipo;
  
  -- Equipa o item selecionado
  update public.inventario
  set equipado = true
  where child_id = child_id_param and item_id = item_id_param;
  
  -- Atualiza campos no children
  if item_tipo = 'avatar' then
    update public.children set avatar_equipado = (select nome from public.loja_itens where id = item_id_param) where id = child_id_param;
  elsif item_tipo = 'borda' then
    update public.children set borda_equipada = (select nome from public.loja_itens where id = item_id_param) where id = child_id_param;
  elsif item_tipo = 'tema' then
    update public.children set tema_equipado = (select nome from public.loja_itens where id = item_id_param) where id = child_id_param;
  end if;
end;
$$;
