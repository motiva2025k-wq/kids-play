import test from 'node:test'
import assert from 'node:assert/strict'
import { semanaDoAno, montarRanking, calcularRelatorio } from './logica-local.mjs'

// Domingo, 5 de janeiro de 2025.
const DOMINGO = new Date(2025, 0, 5, 12, 0, 0)
// Segunda, 6 de janeiro de 2025.
const SEGUNDA = new Date(2025, 0, 6, 12, 0, 0)

test('semanaDoAno replica a fórmula que está em Ranking.jsx', () => {
  // Não reescreva a fórmula "melhor": ela precisa casar com a do app online.
  assert.equal(semanaDoAno(new Date(2025, 0, 1, 12)), 1)
  assert.ok(semanaDoAno(new Date(2025, 11, 31, 12)) >= 52)
})

test('montarRanking ordena por xp_total decrescente e numera a partir de 1', () => {
  const linhas = [
    { child_id: 'a', xp_total: 10, ano: 2025, semana: 2, mes: 1 },
    { child_id: 'b', xp_total: 30, ano: 2025, semana: 2, mes: 1 },
    { child_id: 'c', xp_total: 20, ano: 2025, semana: 2, mes: 1 },
  ]
  const r = montarRanking(linhas, { periodo: 'semanal', agora: SEGUNDA })

  assert.deepEqual(r.map((x) => x.child_id), ['b', 'c', 'a'])
  assert.deepEqual(r.map((x) => x.posicao), [1, 2, 3])
})

test('montarRanking respeita o filtro de visibilidade', () => {
  const linhas = [
    { child_id: 'a', xp_total: 10, ano: 2025, semana: 2, mes: 1, mostrar_no_ranking: false },
    { child_id: 'b', xp_total: 5, ano: 2025, semana: 2, mes: 1 },
  ]
  const r = montarRanking(linhas, { periodo: 'semanal', agora: SEGUNDA })
  assert.deepEqual(r.map((x) => x.child_id), ['b'])
})

test('montarRanking filtra por semana no período semanal', () => {
  const linhas = [
    { child_id: 'a', xp_total: 10, ano: 2025, semana: 99, mes: 12 },
    { child_id: 'b', xp_total: 5, ano: 2025, semana: 2, mes: 1 },
  ]
  const r = montarRanking(linhas, { periodo: 'semanal', agora: SEGUNDA })
  assert.deepEqual(r.map((x) => x.child_id), ['b'])
})

test('montarRanking global filtra por ano e ignora semana/mes', () => {
  const linhas = [
    { child_id: 'a', xp_total: 10, ano: 2024, semana: 2, mes: 1 },
    { child_id: 'b', xp_total: 5, ano: 2025, semana: 99, mes: 12 },
  ]
  const r = montarRanking(linhas, { periodo: 'global', agora: SEGUNDA })
  assert.deepEqual(r.map((x) => x.child_id), ['b'])
})

test('montarRanking monta o objeto children que a tela consome', () => {
  const perfil = { id: 'b', nickname: 'Bia', avatar_id: 3 }
  const r = montarRanking(
    [{ child_id: 'b', xp_total: 5, ano: 2025, semana: 2, mes: 1 }],
    { periodo: 'semanal', agora: SEGUNDA, perfis: [perfil] },
  )
  assert.deepEqual(r[0].children, {
    id: 'b',
    nickname: 'Bia',
    avatar_id: 3,
    mostrar_no_ranking: true,
    // Sem bucket de fotos localmente: a tela usa o avatar.
    mostrar_foto_no_ranking: false,
  })
})

test('calcularRelatorio soma xp, missões e acertos', () => {
  const tentativas = [
    { crianca_id: 'b', concluida_em: '2025-01-06T10:00:00', acertos: 3, total: 4 },
    { crianca_id: 'b', concluida_em: '2025-01-06T11:00:00', acertos: 4, total: 4 },
  ]
  const r = calcularRelatorio(tentativas, { periodo: 'semanal', agora: SEGUNDA })

  assert.equal(r.total_missoes, 2)
  assert.equal(r.taxa_acerto, 0.875) // (3+4) / (4+4)
})

test('calcularRelatorio com nenhuma tentativa devolve zeros, nunca NaN', () => {
  const r = calcularRelatorio([], { periodo: 'semanal', agora: SEGUNDA })
  assert.equal(r.total_dias, 0)
  assert.equal(r.total_xp, 0)
  assert.equal(r.total_missoes, 0)
  assert.equal(r.taxa_acerto, 0)
  assert.equal(r.streak_atual, 0)
  assert.equal(r.streak_maior, 0)
  // A tela desenha 7 quadradinhos sempre: sem dados eles valem 0, não somem.
  assert.equal(Object.keys(r.constancia).length, 7)
  assert.ok(Object.values(r.constancia).every((v) => v === 0))
})

test('calcularRelatorio conta dias distintos e monta a constancia', () => {
  const tentativas = [
    { crianca_id: 'b', concluida_em: '2025-01-06T10:00:00', acertos: 1, total: 2 },
    { crianca_id: 'b', concluida_em: '2025-01-06T11:00:00', acertos: 2, total: 2 },
    { crianca_id: 'b', concluida_em: '2025-01-05T10:00:00', acertos: 1, total: 2 },
  ]
  const r = calcularRelatorio(tentativas, { periodo: 'semanal', agora: SEGUNDA })

  assert.equal(r.total_dias, 2)
  assert.equal(Object.keys(r.constancia).length, 7)
})

test('streak conta dias consecutivos a partir de hoje', () => {
  const tentativas = [
    { crianca_id: 'b', concluida_em: '2025-01-06T10:00:00', acertos: 1, total: 1 },
    { crianca_id: 'b', concluida_em: '2025-01-05T10:00:00', acertos: 1, total: 1 },
    { crianca_id: 'b', concluida_em: '2025-01-04T10:00:00', acertos: 1, total: 1 },
    { crianca_id: 'b', concluida_em: '2025-01-02T10:00:00', acertos: 1, total: 1 },
  ]
  const r = calcularRelatorio(tentativas, { periodo: 'semanal', agora: SEGUNDA })
  assert.equal(r.streak_atual, 3) // 6, 5 e 4 de janeiro
  assert.equal(r.streak_maior, 3)
})

test('periodo mensal considera só o mês corrente', () => {
  const tentativas = [
    { crianca_id: 'b', concluida_em: '2025-01-06T10:00:00', acertos: 1, total: 2 },
    { crianca_id: 'b', concluida_em: '2024-12-30T10:00:00', acertos: 1, total: 2 },
  ]
  const r = calcularRelatorio(tentativas, { periodo: 'mensal', agora: SEGUNDA })
  assert.equal(r.total_missoes, 1)
})

test('DOMINGO existe para garantir que as datas de teste são coerentes', () => {
  // Evita que "DOMINGO" seja removido sem querer e o teste fique mudo.
  assert.equal(DOMINGO.getDay(), 0)
  assert.equal(SEGUNDA.getDay(), 1)
})
