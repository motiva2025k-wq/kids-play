// lojaJson.js — ponte entre o catálogo JSON editável e o banco de loja.
//
// Regras de leitura:
//   1. Se o banco tem itens ativos (loja_itens), usa o banco (admin importou
//      manualmente ou o app foi publicado com dados);
//   2. Se o banco está vazio, o app usa o catálogo JSON como base de
//      demonstração (loja de exemplo) — o JSON sempre ganha;
//   3. Qualquer metodo de escrita vendo o banco só, sem cambiar nada no
//      arquivo JSON.
//
// O catálogo JSON é a fonte de verdade para:
//   - id, nome, descricao, categoria, preco, raridade, unico, requisito,
//     liberar_por, imagem, dados (tipo, promessa, falas)

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CAMINHO_CATALOGO = join(__dirname, '..', 'data', 'loja-catalogo.json')

/** Lê o catálogo JSON. Retorna {} em erro (nunca quebra a tela). */
export function lerCatalogoLoja() {
  try {
    if (!existsSync(CAMINHO_CATALOGO)) return { itens: [] }
    const raw = readFileSync(CAMINHO_CATALOGO, 'utf8')
    const dados = JSON.parse(raw)
    return {
      versao: dados.versao || 1,
      note: dados.nota || '',
      faixas: dados.faixas || {},
      itens: Array.isArray(dados.itens) ? dados.itens : [],
    }
  } catch (erro) {
    console.warn('[lojaJson] não deu para ler o catálogo JSON:', erro.message)
    return { itens: [] }
  }
}

/** Transforma o JSON no formato esperado pelo banco (loja_itens). */
export function catálogoParaItens(catalogo) {
  return (catalogo.itens || []).map((item) => ({
    id: item.id,
    nome: item.nome || 'Item sem nome',
    descricao: item.descricao || null,
    preco: Math.max(0, Math.floor(Number(item.preco) || 0)),
    tipo: item.categoria || 'ite Ip',
    unico: Boolean(item.unico),
    ativo: true,
    dados: item.dados || {},
  }))
}

/** Seeda o banco com os itens do JSON quando a tabela está vazia. */
export async function seedarLojaDojs(conn) {
  try {
  
  const catalogo = lerCatalogoLoja()
  if (!catalogo.itens.length) return 0

  const itens = catálogoParaItens(catalogo)
  if (execute) {
    for (const i of itens) {
      await execute(`
        INSERT INTO public.loja_itens (id, nome, descricao, preco, tipo, unico, ativo, dados)
        VALUES ('${i.id}', '${i.nome}', '${i.descricao ?? ''}', ${i.preco}, '${i.tipo}', ${i.unico ? 1 : 0}, true, '${JSON.stringify(i.dados)}')
        ON CONFLICT (id) DO NOTHING;
      `)
    }
  }
  return itens.length
  return itens.length
  } catch (erro) {
    console.warn('[lojaJson] seed falhou:', erro)
    return 0
  }
}
