// Lista de desejos do Kids_Play.
// Guarda uma lista de ids de itens e calcula o progresso até meta.

import { lerEstado, gravarEstado } from './estado.js';

export function adicionarAoDesejo(id) {
  const estado = lerEstado();
  const ids = [...(estado.lista_desejos ?? [])];

  if (id && !ids.includes(id)) {
    ids.push(id);
    const gravou = gravarEstado({ ...estado, lista_desejos: ids });
    if (gravou) return { sucesso: true, lista: ids };
  }

  return { sucesso: false, mensagem: 'Item já está na lista de desejos.' };
}

export function removerDoDesejo(id) {
  const estado = lerEstado();
  const ids = (estado.lista_desejos ?? []).filter((desejado) => desejado !== id);

  if (ids.length === (estado.lista_desejos ?? []).length) {
    return { sucesso: false, mensagem: 'Item não está na lista de desejos.' };
  }

  const gravou = gravarEstado({ ...estado, lista_desejos: ids });
  if (gravou) return { sucesso: true, lista: ids };

  return { sucesso: false, mensagem: 'Não foi possível atualizar a lista.' };
}

export function temNoDesejo(id) {
  const estado = lerEstado();
  return (estado.lista_desejos ?? []).includes(id);
}

export function progressoDesejos(catalogo) {
  const estado = lerEstado();
  const itens = catalogo?.itens ?? [];
  const listados = (estado.lista_desejos ?? []).filter((id) => itens.some((item) => item.id === id));
  const possiveis = itens.filter((item) => item.venda === true && item.unico !== false).length;

  return {
    item: (!possiveis && listados.length === 0) ? 0 : listados.length,
    total: possiveis,
    completos: listados.filter((id) => itens.some((item) => item.id === id && item.unico === true)).length,
  };
}
