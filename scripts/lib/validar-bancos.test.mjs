// Valida os bancos de questões de `banco-de-questoes/` contra o contrato que o
// app consome. É o teste que impede a repetição do caso `mat3-mult-m5-e3`:
// uma atividade descartada em silêncio por ter resposta `false`.
//
// Verifica estrutura, ids únicos e, principalmente, se `resposta` combina com
// `dados` — porque `dados` é o que o RendererExercicios lê e `resposta` é o que
// o gerador usa para decidir se a atividade entra.
import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TIPOS_SUPORTADOS, normalizarBanco } from './normalizar-conteudo.mjs'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const pasta = join(raiz, 'banco-de-questoes')

const bancos = readdirSync(pasta)
  .filter((a) => a.endsWith('.json'))
  .map((arquivo) => ({ arquivo, banco: JSON.parse(readFileSync(join(pasta, arquivo), 'utf8')) }))

const atividades = bancos.flatMap(({ arquivo, banco }) =>
  (banco.missoes ?? []).flatMap((m) =>
    (m.atividades ?? []).map((a) => ({ arquivo, missao: m, atividade: a })),
  ),
)

test('existe pelo menos um banco e ele tem missões', () => {
  assert.ok(bancos.length > 0)
  for (const { arquivo, banco } of bancos) {
    assert.ok((banco.missoes ?? []).length > 0, `${arquivo} sem missões`)
  }
})

test('todo banco declara ano, matéria e trilha', () => {
  for (const { arquivo, banco } of bancos) {
    assert.match(String(banco.ano), /^\d+º$/, `${arquivo}: ano fora do padrão "3º"`)
    assert.ok(banco.materia, `${arquivo}: falta matéria`)
    assert.ok(banco.trilha, `${arquivo}: falta trilha`)
  }
})

test('nenhum id de missão ou atividade se repete entre anos', () => {
  const idsMissoes = new Set()
  for (const { arquivo, banco } of bancos) {
    for (const m of banco.missoes ?? []) {
      assert.ok(m.id, `${arquivo}: missão sem id`)
      assert.ok(!idsMissoes.has(m.id), `id de missão repetido: ${m.id}`)
      idsMissoes.add(m.id)
    }
  }

  const idsAtividades = new Set()
  for (const { atividade } of atividades) {
    assert.ok(atividade.id, 'atividade sem id')
    assert.ok(!idsAtividades.has(atividade.id), `id de atividade repetido: ${atividade.id}`)
    idsAtividades.add(atividade.id)
  }
})

test('toda atividade tem o que a tela precisa', () => {
  for (const { atividade: a } of atividades) {
    const onde = `[${a.id}]`
    assert.ok(TIPOS_SUPORTADOS.includes(a.tipo), `${onde} tipo não suportado: ${a.tipo}`)
    assert.ok([1, 2, 3].includes(a.dificuldade), `${onde} dificuldade fora de 1..3`)
    assert.ok(a.enunciado?.trim(), `${onde} sem enunciado`)
    assert.ok(a.codigo_bncc, `${onde} sem código BNCC`)
    assert.ok(a.habilidade?.trim(), `${onde} sem habilidade`)
    assert.ok(a.dica1?.trim(), `${onde} sem dica1`)
    assert.ok(a.dica2?.trim(), `${onde} sem dica2`)
    assert.ok(a.explicacao?.trim(), `${onde} sem explicação`)
    assert.ok(a.dados && typeof a.dados === 'object', `${onde} sem dados`)
    // A ausência é o único motivo válido de descarte.
    assert.ok(a.resposta !== undefined && a.resposta !== null, `${onde} sem resposta`)
  }
})

test('multipla_escolha: exatamente uma correta e resposta igual a ela', () => {
  for (const { atividade: a } of atividades.filter((x) => x.atividade.tipo === 'multipla_escolha')) {
    const alts = a.dados.alternativas ?? []
    assert.ok(alts.length >= 2, `[${a.id}] precisa de ao menos 2 alternativas`)

    const corretas = alts.filter((alt) => alt.correta === true)
    assert.equal(corretas.length, 1, `[${a.id}] deve ter exatamente uma alternativa correta`)

    assert.equal(String(a.resposta), corretas[0].texto, `[${a.id}] resposta não bate com dados`)

    const textos = alts.map((alt) => alt.texto)
    assert.equal(new Set(textos).size, textos.length, `[${a.id}] alternativas repetidas`)
  }
})

test('completar: a correta existe entre as opções e é a resposta', () => {
  for (const { atividade: a } of atividades.filter((x) => x.atividade.tipo === 'completar')) {
    const textos = (a.dados.opcoes ?? []).map((o) => o.texto)
    assert.ok(textos.length >= 2, `[${a.id}] precisa de opções`)
    assert.ok(textos.includes(a.dados.correta), `[${a.id}] correta não está entre as opções`)
    assert.equal(String(a.resposta), a.dados.correta, `[${a.id}] resposta não bate com dados`)
    assert.equal(new Set(textos).size, textos.length, `[${a.id}] opções repetidas`)
    assert.match(a.enunciado, /___/, `[${a.id}] enunciado sem lacuna ___`)
  }
})

test('verdadeiro_falso: resposta booleana igual a dados.correta', () => {
  for (const { atividade: a } of atividades.filter((x) => x.atividade.tipo === 'verdadeiro_falso')) {
    assert.equal(typeof a.dados.correta, 'boolean', `[${a.id}] dados.correta deve ser booleano`)
    assert.equal(a.resposta, a.dados.correta, `[${a.id}] resposta não bate com dados`)
  }
})

test('contar_imagens: correta é uma das opções e resposta é o mesmo número', () => {
  for (const { atividade: a } of atividades.filter((x) => x.atividade.tipo === 'contar_imagens')) {
    const opcoes = a.dados.opcoes ?? []
    assert.ok(opcoes.length >= 3, `[${a.id}] precisa de opções`)
    assert.ok(opcoes.includes(a.dados.correta), `[${a.id}] correta fora das opções`)
    assert.equal(String(a.resposta), String(a.dados.correta), `[${a.id}] resposta não bate com dados`)
    assert.equal(new Set(opcoes).size, opcoes.length, `[${a.id}] opções repetidas`)
  }
})

test('arrastar_soltar: ordem esperada usa os mesmos ids dos itens', () => {
  for (const { atividade: a } of atividades.filter((x) => x.atividade.tipo === 'arrastar_soltar')) {
    assert.equal(a.dados.modo, 'ordenar', `[${a.id}] modo não suportado na validação`)
    const ids = (a.dados.itens ?? []).map((i) => i.id)
    const ordem = a.dados.ordemEsperada ?? []

    assert.equal(ids.length, ordem.length, `[${a.id}] ordemEsperada com tamanho diferente`)
    assert.deepEqual([...ids].sort(), [...ordem].sort(), `[${a.id}] ordemEsperada não é permutação`)
    assert.deepEqual(a.resposta, ordem, `[${a.id}] resposta não bate com dados`)
  }
})

test('nenhuma atividade é descartada pelo gerador', () => {
  for (const { arquivo, banco } of bancos) {
    const r = normalizarBanco(banco)
    assert.deepEqual(
      r.descartadas,
      [],
      `${arquivo}: descartadas → ${JSON.stringify(r.descartadas)}`,
    )
  }
})
