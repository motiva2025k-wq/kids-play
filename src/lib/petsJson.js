// petsJson.js — ponte entre o catálogo de espécies de pets (JSON editável)
// e o estado da tela. Nenhuma escrita no arquivo; apenas leitura.
//
// Modelo que o banco pensa em usar (dados do SQL):
//   pets(child_id, especie_id, nome, estagio, xp, energia, acessorio_id,
//        cor_id, criado_em)
// O estado local aplica a chave: `${childId}:${petId ?? especieId}`
//
// Import estático de JSON (mesmo padrão de falas.mjs): funciona no Vite e
// no Node ≥ 22, sem `node:fs` — que não existe no navegador.

import catalogoEstatico from '../data/pets-catalogo.json' with { type: 'json' }

export function lerCatalogoPets() {
  try {
    const dados = JSON.parse(JSON.stringify(catalogoEstatico))
    return {
      versao: dados.versao || 1,
      especies: Array.isArray(dados.especies) ? dados.especies : [],
    }
  } catch (erro) {
    console.warn('[petsJson] não deu para ler o catálogo de pets:', erro.message)
    return { especies: [] }
  }
}

/** Devolve a espécie completa do catálogo, ou null. */
export function buscarEspeciePets(catalogo, id) {
  return catalogo.especies.find((e) => e.id === id) ?? null
}

/** Lista de espécies disponíveis (os 6 originais do projeto). */
export function especiesDisponiveisPets() {
  const catalogo = lerCatalogoPets()
  return [...catalogo.especies].sort((a, b) => a.nome.localeCompare(b.nome))
}

/** Pega o SVG de um estágio de uma espécie, com fallback para o SVG padrão. */
export function svgDeEspecie(especie, estagio = 'filhote', cor = null) {
  if (!especie?.svg) return null
  return especie.svg(estagio, cor ?? especie.corPadrao)
}
