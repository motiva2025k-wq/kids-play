// Catálogo `kidsplay-catalogo-inicial.json`. Import estático de JSON: o Vite
// embute no bundle (navegador) e o Node ≥ 22 lê com "type: json". Assim o
// módulo funciona nos dois ambientes sem `node:fs` — que não existe no
// navegador e quebrava a tela.

import catalogoEstatico from '../data/kidsplay-catalogo-inicial.json' with { type: 'json' }

function catálogoPadrao() {
  return {
    economia: {
      moeda: 'moedas',
      regras: { sem_dinheiro_real: true, sem_caixa_surpresa: true, sem_perda_de_consistencia: true },
      ganhos: [],
      faixas_preco: {},
    },
    categorias_loja: [],
    itens: [],
    pets: [],
    quests: [],
    eventos: [],
    itens_unicos_do_evento: [],
  }
}

export async function lerCatalogo() {
  try {
    const dados = JSON.parse(JSON.stringify(catalogoEstatico))
    if (!dados || typeof dados !== 'object') {
      return catálogoPadrao()
    }
    if (!Array.isArray(dados.itens)) dados.itens = []
    if (!Array.isArray(dados.categorias_loja)) dados.categorias_loja = []
    if (!Array.isArray(dados.pets)) dados.pets = []
    if (!Array.isArray(dados.quests)) dados.quests = []
    if (!Array.isArray(dados.eventos)) dados.eventos = []
    if (!Array.isArray(dados.itens_unicos_do_evento)) dados.itens_unicos_do_evento = []
    return dados
  } catch {
    return catálogoPadrao()
  }
}
