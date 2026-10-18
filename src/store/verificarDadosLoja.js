// Verificação de segurança dos dados da loja.
// Evita renderizar de um catálogo corrompido e exibe um erro amigável
// se o JSON não tiver o formato esperado ou se o catálogo estiver vazio.

import { parsearCatalogo, estadoLoja, eItemValido } from './loja.js';

export function temDadosLoja(catalogo) {
  if (!catalogo || typeof catalogo !== 'object') return false;
  if (!Array.isArray(catalogo.itens) || catalogo.itens.length === 0) return false;
  if (!Array.isArray(catalogo.categorias_loja) || catalogo.categorias_loja.length === 0) return false;
  return true;
}

export function validarDadosLoja(catalogo) {
  const erros = [];
  if (!catalogo || typeof catalogo !== 'object') {
    return ['O arquivo de dados da loja não está disponível.'];
  }
  if (!Array.isArray(catalogo.itens)) {
    erros.push('O catálogo não tem uma lista de itens.');
  } else if (catalogo.itens.length === 0) {
    erros.push('O catálogo não tem itens para vender.');
  }
  if (!Array.isArray(catalogo.categorias_loja)) {
    erros.push('O catálogo não tem categorias.');
  }
  if (!Array.isArray(catalogo.economia?.ganhos) || catalogo.economia?.ganhos.length === 0) {
    erros.push('O catálogo não tem regras de ganhos.');
  }
  return erros;
}
