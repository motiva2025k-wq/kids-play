import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizarBanco, TIPOS_SUPORTADOS } from './normalizar-conteudo.mjs'

function bancoExemplo() {
  return {
    ano: '3º',
    materia: 'Matemática',
    missoes: [
      {
        id: 'm1',
        titulo: 'Missão Um',
        objetivo: 'Objetivo um',
        atividades: [
          {
            id: 'm1-a1',
            tipo: 'multipla_escolha',
            dificuldade: 1,
            enunciado: 'Quanto é 2 + 2?',
            resposta: '4',
            dica1: 'Some os dedos.',
            dica2: 'São dois e mais dois.',
            explicacao: '2 + 2 = 4',
            dados: { opcoes: [3, 4, 5], correta: 4 },
          },
        ],
      },
    ],
  }
}

test('converte atividades no formato que o RendererExercicios consome', () => {
  const r = normalizarBanco(bancoExemplo())
  const q = r.missoes[0].perguntas[0]

  assert.equal(q.id, 'm1-a1')
  assert.equal(q.missao_id, 'm1')
  assert.equal(q.tipo, 'multipla_escolha')
  assert.equal(q.enunciado, 'Quanto é 2 + 2?')
  assert.deepEqual(q.dados, { opcoes: [3, 4, 5], correta: 4 })
  assert.equal(q.ordem, 1)
})

test('concatena dica1 e dica2 numa única dica', () => {
  const r = normalizarBanco(bancoExemplo())
  assert.equal(r.missoes[0].perguntas[0].dica, 'Some os dedos. São dois e mais dois.')
})

test('quando só existe dica1, a dica sai sem espaço no fim', () => {
  const b = bancoExemplo()
  delete b.missoes[0].atividades[0].dica2
  const r = normalizarBanco(b)
  assert.equal(r.missoes[0].perguntas[0].dica, 'Some os dedos.')
})

test('descarta atividade sem resposta e relata o motivo', () => {
  const b = bancoExemplo()
  delete b.missoes[0].atividades[0].resposta
  const r = normalizarBanco(b)
  assert.equal(r.missoes.length, 0)
  assert.equal(r.descartadas.length, 1)
  assert.equal(r.descartadas[0].motivo, 'sem_resposta')
  assert.equal(r.descartadas[0].atividade, 'm1-a1')
})

test('resposta false é resposta válida (verdadeiro/falso) e não é descartada', () => {
  const b = bancoExemplo()
  const at = b.missoes[0].atividades[0]
  at.tipo = 'verdadeiro_falso'
  at.resposta = false
  at.dados = { correta: false }

  const r = normalizarBanco(b)
  assert.equal(r.descartadas.length, 0)
  assert.equal(r.missoes[0].perguntas[0].dados.correta, false)
})

test('resposta 0 também é resposta válida', () => {
  const b = bancoExemplo()
  const at = b.missoes[0].atividades[0]
  at.resposta = 0
  at.dados = { opcoes: [0, 1, 2], correta: 0 }

  const r = normalizarBanco(b)
  assert.equal(r.descartadas.length, 0)
})

test('descarta tipo fora da lista suportada', () => {
  const b = bancoExemplo()
  b.missoes[0].atividades[0].tipo = 'arrastar_e_solte'
  const r = normalizarBanco(b)
  assert.equal(r.descartadas[0].motivo, 'tipo_invalido')
})

test('descarta atividade sem dados (o renderer precisa deles)', () => {
  const b = bancoExemplo()
  delete b.missoes[0].atividades[0].dados
  const r = normalizarBanco(b)
  assert.equal(r.descartadas[0].motivo, 'sem_dados')
})

test('ordem das missões e das perguntas começa em 1 e é sequencial', () => {
  const r = normalizarBanco(bancoExemplo())
  assert.equal(r.missoes[0].ordem, 1)
  assert.equal(r.missoes[0].perguntas[0].ordem, 1)
})

test('preenche descricao, ano, materia_id e ativa', () => {
  const r = normalizarBanco(bancoExemplo(), { materiaId: 'local-mat' })
  const m = r.missoes[0]
  assert.equal(m.descricao, 'Objetivo um')
  assert.equal(m.ano, '3º')
  assert.equal(m.materia_id, 'local-mat')
  assert.equal(m.ativa, true)
  assert.equal(r.materia_id, 'local-mat')
})

test('missão sem nenhuma pergunta válida não entra no resultado', () => {
  const b = bancoExemplo()
  delete b.missoes[0].atividades[0].resposta
  const r = normalizarBanco(b)
  assert.equal(r.missoes.length, 0)
})

test('tipos suportados casam com o RendererExercicios', () => {
  assert.deepEqual(TIPOS_SUPORTADOS.sort(), [
    'arrastar_soltar',
    'completar',
    'contar_imagens',
    'multipla_escolha',
    'verdadeiro_falso',
  ].sort())
})
