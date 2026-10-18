/**
 * testar-motor.mjs — verifica o motor de missão puro (motorMissao.mjs).
 * Sem React nem Supabase: roda com `node scripts/testar-motor.mjs`.
 */

import {
  criarMotor,
  perguntaAtual,
  totalPerguntas,
  posicaoAtual,
  responder,
  usarDica,
  calcularResultado,
  calcularEstrelas,
} from '../src/lib/motorMissao.mjs'

let erros = 0
let oks = 0

function ok(cond, msg) {
  if (cond) {
    oks++
    console.log('✓ ' + msg)
  } else {
    erros++
    console.error('✗ ' + msg)
  }
}

// pergunta falsa (o motor só precisa de id)
function perguntas(n) {
  return Array.from({ length: n }, (_, i) => ({ id: 'p' + (i + 1) }))
}

// 1) criação e progressão básica
const m1 = criarMotor(perguntas(3))
ok(totalPerguntas(m1) === 3, 'motor: 3 perguntas')
ok(perguntaAtual(m1)?.id === 'p1', '1ª pergunta é p1')
ok(posicaoAtual(m1) === 1, 'posição inicial = 1')

// 2) acerto simples dispara "acerto"
const rAcerto = responder(m1, true)
ok(rAcerto.evento === 'acerto', 'acerto único → evento "acerto"')
ok(m1.acertos === 1, 'acertos = 1')
ok(posicaoAtual(m1) === 2, 'avançou para a posição 2')

// 3) erro dispara "explicacao_apos_erro" e conta erro
const rErro = responder(m1, false)
ok(rErro.evento === 'explicacao_apos_erro', 'erro → evento "explicacao_apos_erro"')
ok(m1.erros === 1, 'erros = 1')
ok(m1.acertos === 1, 'acertos continua 1')

// 4) sequência de 3 acertos seguidos → "acerto_sequencia"
const m2 = criarMotor(perguntas(4))
responder(m2, true) // acerto (1º)
const rSeq2 = responder(m2, true) // acerto (2º)
ok(rSeq2.evento === 'acerto', '2º acerto seguido ainda é "acerto"')
const rSeq3 = responder(m2, true) // acerto (3º) → sequência
ok(rSeq3.evento === 'acerto_sequencia', '3 acertos seguidos → "acerto_sequencia"')

// 5) dica é contada e não repete
const m3 = criarMotor(perguntas(1))
usarDica(m3)
usarDica(m3) // segunda chamada não deve contar de novo
ok(m3.dicasUsadas === 1, 'dica contada uma vez por pergunta')

// 6) resultado: perfeito = 3 estrelas, XP/moedas cheios
const mPerfeito = criarMotor(perguntas(5))
for (let i = 0; i < 5; i++) responder(mPerfeito, true)
const rPerfeito = calcularResultado(mPerfeito)
ok(rPerfeito.percentual === 100, '5/5 → 100%')
ok(rPerfeito.estrelas === 3, '100% → 3 estrelas')
ok(rPerfeito.xp === 15, '3 estrelas → 15 XP')
ok(rPerfeito.moedas === 12, '3 estrelas → 12 moedas')

// 7) resultado com erro: percentual/estrelas menores
const mMeio = criarMotor(perguntas(4))
responder(mMeio, true)
responder(mMeio, false)
responder(mMeio, true)
responder(mMeio, true)
const rMeio = calcularResultado(mMeio)
ok(rMeio.acertos === 3 && rMeio.total === 4, '3 acertos de 4')
ok(rMeio.percentual === 75, '3/4 → 75%')
ok(rMeio.estrelas === 2, '75% → 2 estrelas')

// 8) missão refeita tem XP/meio
const mRef = criarMotor(perguntas(5), { refeita: true })
for (let i = 0; i < 5; i++) responder(mRef, true)
const rRef = calcularResultado(mRef)
ok(rRef.refeita === true, 'refeita = true')
ok(rRef.xp === 8, 'refeita: 15 XP vira 8 (arredondado)')

// 9) faixas de estrelas
ok(calcularEstrelas(100) === 3, '100% → 3★')
ok(calcularEstrelas(70) === 2, '70% → 2★')
ok(calcularEstrelas(50) === 1, '50% → 1★')
ok(calcularEstrelas(49) === 0, '49% → 0★')

// 10) motor com 0 perguntas já nasce finalizado
const mVazio = criarMotor([])
ok(mVazio.finalizado === true, 'missão sem perguntas nasce finalizada')
ok(perguntaAtual(mVazio) === null, 'sem pergunta atual')

console.log('')
if (erros === 0) {
  console.log('Tudo certo — motor de missão verificado (' + oks + ' ok).')
} else {
  console.error(erros + ' ponto(s) com problema no motor.')
}
process.exit(erros === 0 ? 0 : 1)
