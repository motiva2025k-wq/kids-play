// Kids_Play — validação do catálogo de itens.
// Garante que o JSON no carregamento não quebre a tela e que a loja
// só mostra itens válidos e seguros para a economia do jogador.

import { categoriasLoja } from '../store/categorias.js';

export function validarCatalogo(catalogo) {
  const erros = [];
  const ids = new Set();
  const categoriasIds = new Set(categoriasLoja.map((c) => c.id));

  const itens = catalogo.itens ?? [];
  const idsUnicos = new Set();

  for (let i = 0; i < itens.length; i += 1) {
    const item = itens[i];
    const numero = i + 1;

    if (!item || typeof item !== 'object') {
      erros.push(`itens[${numero}] não é um objeto.`);
      continue;
    }

    if (!item.id || typeof item.id !== 'string') {
      erros.push(`itens[${numero}] não tem id de string.`);
    } else if (idsUnicos.has(item.id)) {
      erros.push(`itens[${numero}] tem id duplicado: ${item.id}.`);
    } else {
      idsUnicos.add(item.id);
    }

    if (!item.categoria || typeof item.categoria !== 'string') {
      erros.push(`itens[${numero}] (${item.id}) não tem categoria de string.`);
    } else if (!categoriasIds.has(item.categoria)) {
      erros.push(`itens[${numero}] (${item.id}) usa categoria desconhecida: ${item.categoria}.`);
    }

    const preco = item.preco;
    if (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0) {
      erros.push(`itens[${numero}] (${item.id}) tem preco inválido: ${preco}.`);
    }

    if (item.requisito !== null && item.requisito !== undefined) {
      if (typeof item.requisito !== 'object' || Array.isArray(item.requisito)) {
        erros.push(`itens[${numero}] (${item.id}) tem requisito inválido.`);
      } else {
        const requisito = item.requisito;
        if (requisito.tipo !== 'nivel' && requisito.tipo !== 'dias_seguidos' && requisito.tipo !== 'quest') {
          erros.push(`itens[${numero}] (${item.id}) tem requisito.tipo inválido: ${requisito.tipo}.`);
        }
        if (typeof requisito.valor !== 'number' || !Number.isInteger(requisito.valor) || requisito.valor < 0) {
          erros.push(`itens[${numero}] (${item.id}) tem requisito.valor inválido: ${requisito.valor}.`);
        }
      }
    }

    if (item.venda !== false && item.venda !== true) {
      erros.push(`itens[${numero}] (${item.id}) tem venda inválido: ${item.venda}.`);
    }

    if (item.unico !== false && item.unico !== true) {
      erros.push(`itens[${numero}] (${item.id}) tem unico inválido: ${item.unico}.`);
    }

    if (item.tamanho !== 'pequeno' && item.tamanho !== 'medio' && item.tamanho !== 'grande') {
      erros.push(`itens[${numero}] (${item.id}) tem tamanho inválido: ${item.tamanho}.`);
    }
  }

  for (const categoria of catalogo.categorias_loja ?? []) {
    if (!categoria.id || typeof categoria.id !== 'string') {
      erros.push('categorias_loja: falta id de string.');
    }
    if (!categoria.nome || typeof categoria.nome !== 'string') {
      erros.push('categorias_loja: falta nome de string.');
    }
    if (!categoria.icone || typeof categoria.icone !== 'string') {
      erros.push('categorias_loja: falta icone de string.');
    }
  }

  if (!Array.isArray(catalogo.pets) || catalogo.pets.some((p) => !p || typeof p !== 'object')) {
    erros.push('pets: deve ser um array de objetos.');
  }

  if (!Array.isArray(catalogo.quests) || catalogo.quests.some((q) => !q || typeof q !== 'object')) {
    erros.push('quests: deve ser um array de objetos.');
  }

  if (!Array.isArray(catalogo.eventos) || catalogo.eventos.some((e) => !e || typeof e !== 'object')) {
    erros.push('eventos: deve ser um array de objetos.');
  }

  if (Array.isArray(catalogo.itens_unicos_do_evento)) {
    const idsUnicosEvento = new Set();
    for (let i = 0; i < catalogo.itens_unicos_do_evento.length; i += 1) {
      const item = catalogo.itens_unicos_do_evento[i];
      if (!item || typeof item !== 'object') {
        erros.push(`itens_unicos_do_evento[${i + 1}] não é um objeto.`);
        continue;
      }
      if (!item.id || typeof item.id !== 'string') {
        erros.push(`itens_unicos_do_evento[${i + 1}] não tem id de string.`);
      } else if (idsUnicosEvento.has(item.id)) {
        erros.push(`itens_unicos_do_evento[${i + 1}] tem id duplicado: ${item.id}.`);
      } else {
        idsUnicosEvento.add(item.id);
      }
      if (!item.evento || typeof item.evento !== 'string') {
        erros.push(`itens_unicos_do_evento[${i + 1}] não tem evento de string.`);
      }
    }
  }

  return erros;
}

export function validarBinario(catalogo) {
  const erros = validarCatalogo(catalogo);
  const itens = catalogo.itens ?? [];
  const ids = new Set();

  for (const item of itens) {
    if (item && typeof item === 'object' && item.id) {
      if (ids.has(item.id)) {
        erros.push(`id duplicado no binário: ${item.id}.`);
      }
      ids.add(item.id);
    }
  }

  for (const item of itens) {
    if (item && item.venda === false && item.unico !== true) {
      erros.push(`itens[${item.id}] tem venda=false sem unico=true.`);
    }
  }

  return erros;
}