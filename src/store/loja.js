// Loja do Kids_Play.
// Parseia o catálogo, executa checagens obrigatórias e tenta uma
// transação atômica: validar, bloquear, reler estado, garantir loja
// ativa, itens, venda=true, requisito, moedas suficientes, exclusividade.

import { lerEstado, gravarEstado } from './estado.js';
import { aguardarOuRecusar, zerarBloqueio } from './economia.js';
export function parsearCatalogo(catalogo) {
  const itens = catalogo?.itens ?? [];
  const categorias = new Map(catalogo?.categorias_loja?.map((c) => [c.id, c]) ?? []);

  const porId = new Map();
  for (const item of itens) {
    if (!item || typeof item !== 'object') continue;
    porId.set(item.id, item);
  }

  return { itens, porId, categorias };
}

export function eItemValido(catalogo, id) {
  const item = catalogo.porId.get(id);
  if (!item) return false;
  return item.venda === true && item.unico !== false && !item.unico;
}

export function eItemUnico(catalogo, id) {
  const item = catalogo.porId.get(id);
  return Boolean(item && item.unico === true);
}

export function eConsumivel(catalogo, id) {
  const item = catalogo.porId.get(id);
  return Boolean(item && item.unico === false && item.venda === true);
}

export function temRequisito(catalogo, item) {
  return Boolean(item && item.requisito);
}

export function requisitoAtendido(catalogo, estado, item) {
  const requisito = item?.requisito;
  if (!requisito) return true;

  switch (requisito.tipo) {
    case 'nivel':
      return estado.nivel >= requisito.valor;
    case 'dias_seguidos':
      return estado.dias_seguidos >= requisito.valor;
    case 'quest':
      return Boolean(estado.quest_completa && estado.quest_completa.id === requisito.valor);
    default:
      return false;
  }
}

export function dicaRequisito(item) {
  const requisito = item?.requisito;
  if (!requisito) return null;
  switch (requisito.tipo) {
    case 'nivel':
      return `Chegue ao nível ${requisito.valor}.`;
    case 'dias_seguidos':
      return `Complete ${requisito.valor} dias seguidos.`;
    case 'quest':
      return `Complete a missão "@${requisito.valor}".`;
    default:
      return null;
  }
}

export function calcularFaltaMoedas(item, estado) {
  const falta = item.preco - estado.moedas;
  return falta > 0 ? falta : 0;
}

export function estadoLoja(catalogo, estado, id) {
  const item = catalogo.porId.get(id);
  if (!item) return 'desconhecido';
  if (item.venda === false) return 'sem_venda';
  if (eItemUnico(catalogo, id)) {
    return 'unico';
  }
  if (temRequisito(catalogo, item) && !requisitoAtendido(catalogo, estado, item)) {
    return 'bloqueado';
  }
  if (item.unico === false && estado.inventario[id] > 0) {
    return 'possuido';
  }
  if (estado.inventario[id] > 0) {
    return 'possuido';
  }
  if (estado.equipados?.avatar === id || estado.equipados?.moldura_fundo === id || estado.equipados?.balao === id || estado.equipados?.cenario === id || estado.equipados?.titulo === id) {
    return 'equipado';
  }
  return 'disponivel';
}

/**
 * Tenta comprar um item.
 *
 * Retorna um objeto:
 * {
 *   sucesso: boolean,
 *   mensagem: string,
 *   estadoAtualizado: boolean,
 *   item: object | null,
 *   preco: number | null,
 *   falta: number | null
 * }
 *
 * A transação é atômica dentro de um Web Lock (se disponível) e
 * revalida o estado no momento da escrita. Somente um clique ativo
 * por vez pode passar, mesmo em abas concorrentes.
 */
export async function comprarItem(catalogo, estado, id) {
  const item = catalogo.porId.get(id);
  if (!item) return { sucesso: false, mensagem: 'Item não encontrado.', estadoAtualizado: false, item: null, preco: null, falta: null };

  if (item.venda === false) {
    return { sucesso: false, mensagem: 'Esse item só é ganho em missões e eventos.', estadoAtualizado: false, item: null, preco: null, falta: null };
  }

  if (temRequisito(catalogo, item) && !requisitoAtendido(catalogo, estado, item)) {
    return { sucesso: false, mensagem: dicaRequisito(item), estadoAtualizado: false, item: null, preco: null, falta: null };
  }

  if (estado.moedas < item.preco) {
    return { sucesso: false, mensagem: `Faltam ${item.preco - estado.moedas} moedas para comprar.`, estadoAtualizado: false, item: null, preco: item.preco, falta: item.preco - estado.moedas };
  }

  const stateUnix = await obterEstadoParaCompra();
  if (!stateUnix) {
    return { sucesso: false, mensagem: 'Não foi possível concluir a compra agora. Tente novamente.', estadoAtualizado: false, item: null, preco: null, falta: null };
  }

  const novo = {
    ...stateUnix,
    moedas: stateUnix.moedas - item.preco,
    inventario: { ...stateUnix.inventario },
    historico_compras: [...stateUnix.historico_compras, { id, preco: item.preco, data: new Date().toISOString() }],
    atualizando: false,
  };

  if (item.unico === false) {
    novo.inventario[id] = (novo.inventario[id] || 0) + 1;
  } else {
    novo.inventario = { ...novo.inventario, [id]: 1 };
    novo.equipados = { ...novo.equipados };
  }

  const gravou = gravarEstado(novo);
  if (gravou) {
    return { sucesso: true, mensagem: `Compra concluída: ${item.nome}.`, estadoAtualizado: true, item, preco: item.preco, falta: null };
  }

  return { sucesso: false, mensagem: 'Falha na gravação, tente novamente.', estadoAtualizado: false, item, preco: item.preco, falta: null };
}

// Bloqueia a compra entre abas. O próprio tab não recebe o
// evento storage, por isso sincroniza sua própria variável em
// memória e sinaliza os listeners do estado.
async function obterEstadoParaCompra() {
  const ok = await aguardarOuRecusar();
  if (!ok) return null;
  try {
    const estado = lerEstado();
    return estado;
  } finally {
    zerarBloqueio();
  }
}
