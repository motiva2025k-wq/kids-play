#!/usr/bin/env node
// Lê banco-de-questoes/*.json, normaliza para o formato do app e grava
// src/data/conteudo-local.json. Roda via `npm run gerar-conteudo`.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizarBanco } from './lib/normalizar-conteudo.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const origem = join(raiz, 'banco-de-questoes')
const destino = join(raiz, 'src', 'data', 'conteudo-local.json')

let arquivos
try {
  arquivos = readdirSync(origem).filter((a) => a.endsWith('.json'))
} catch {
  console.error(`\n  ✗ Não achei a pasta ${origem}\n`)
  process.exit(1)
}

if (arquivos.length === 0) {
  console.error('\n  ✗ Nenhum .json em banco-de-questoes/\n')
  process.exit(1)
}

const porAno = new Map()
const descartadas = []

for (const arquivo of arquivos) {
  const bruto = JSON.parse(readFileSync(join(origem, arquivo), 'utf8'))
  const r = normalizarBanco(bruto)

  descartadas.push(...r.descartadas.map((d) => ({ ...d, arquivo })))

  const chave = r.ano || 'sem-ano'
  const atual = porAno.get(chave) ?? {
    ano: r.ano,
    materia: r.materia,
    materia_id: r.materia_id,
    missoes: [],
  }
  atual.missoes.push(...r.missoes)
  porAno.set(chave, atual)
}

const saida = {
  gerado_em: new Date().toISOString(),
  anos: [...porAno.values()],
}

writeFileSync(destino, `${JSON.stringify(saida, null, 2)}\n`, 'utf8')

let totalMissoes = 0
let totalPerguntas = 0
for (const a of porAno.values()) {
  totalMissoes += a.missoes.length
  for (const m of a.missoes) totalPerguntas += m.perguntas.length
}

console.log(`\n  ✓ ${destino.replace(raiz, '.')}`)
console.log(`    anos: ${[...porAno.keys()].join(', ')}`)
console.log(`    missões: ${totalMissoes} · perguntas: ${totalPerguntas}`)

if (descartadas.length) {
  console.log(`\n  ⚠ ${descartadas.length} atividade(s) descartada(s):`)
  for (const d of descartadas) {
    console.log(`    · ${d.atividade} (${d.motivo}) — ${d.arquivo}`)
  }
} else {
  console.log('    nenhuma atividade descartada')
}
console.log('')
