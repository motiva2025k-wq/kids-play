// Testes do repositório local com um localStorage de mentira.
// Assim o caminho offline (perfis, tentativas, XP, ranking, relatório) é
// verificado sem navegador.
import test, { beforeEach } from 'node:test'
import assert from 'node:assert/strict'

class ArmazenamentoFalso {
  #mapa = new Map()
  getItem(chave) {
    return this.#mapa.has(chave) ? this.#mapa.get(chave) : null
  }
  setItem(chave, valor) {
    this.#mapa.set(chave, String(valor))
  }
  removeItem(chave) {
    this.#mapa.delete(chave)
  }
  clear() {
    this.#mapa.clear()
  }
}

globalThis.localStorage = new ArmazenamentoFalso()

// Importado depois do stub: o módulo lê localStorage em tempo de chamada,
// mas assim a ordem fica explícita.
const repo = await import('./local.js')

async function comPerfil(extra = {}) {
  return repo.criarPerfil({
    nickname: 'Bia',
    school_year: '3',
    avatar_id: 'capivara',
    ...extra,
  })
}

beforeEach(() => {
  localStorage.clear()
})

test('criarPerfil grava os mesmos defaults que o banco daria', async () => {
  const perfil = await comPerfil()

  assert.equal(perfil.guardian_id, 'local')
  assert.equal(perfil.xp, 0)
  assert.equal(perfil.coins, 0)
  // `stage` é texto no banco (aldeia|vila|castelo|reino), não número.
  assert.equal(perfil.stage, 'aldeia')
  assert.equal(perfil.mostrar_no_ranking, true)

  const perfis = await repo.listarPerfis()
  assert.equal(perfis.length, 1)
  assert.equal(perfis[0].id, perfil.id)
})

test('carregarMissoes casa o ano do perfil ("3") com o do conteúdo ("3º")', async () => {
  const terceiro = await repo.carregarMissoes('3')
  assert.equal(terceiro.length, 5)
  assert.equal(terceiro[0].id, 'mat3-mult-m1')
  // O conteúdo embarcado é de Matemática; `materiaId` é ignorado de propósito.
  assert.equal(terceiro[0].concluida_por.length, 0)

  // Cada ano entrega a sua própria trilha, não a de outro ano.
  const segundo = await repo.carregarMissoes('2')
  assert.equal(segundo[0].id, 'mat2-soma-m1')

  // Aceita o ano com ordinal também.
  const quarto = await repo.carregarMissoes('4º')
  assert.equal(quarto[0].id, 'mat4-mult-m1')

  // Ano sem banco embarcado devolve [] — é o caso que mostra o aviso na tela.
  assert.deepEqual(await repo.carregarMissoes('1'), [])
})

test('carregarMissaoComPerguntas traz perguntas ordenadas e a matéria', async () => {
  const missao = await repo.carregarMissaoComPerguntas('mat3-mult-m1')

  assert.equal(missao.materias.nome, 'Matemática')
  assert.ok(missao.perguntas.length > 0)
  const ordens = missao.perguntas.map((p) => p.ordem)
  assert.deepEqual(ordens, [...ordens].sort((a, b) => a - b))

  assert.equal(await repo.carregarMissaoComPerguntas('nao-existe'), null)
})

test('concluir a missão soma XP e moedas no perfil e no ranking', async () => {
  const perfil = await comPerfil()
  const id = await repo.iniciarTentativa({
    crianca_id: perfil.id,
    missao_id: 'mat3-mult-m1',
    total: 6,
  })
  assert.ok(id)

  await repo.concluirTentativa(id, { acertos: 5, total: 6, xp: 30, moedas: 20, refeita: false })

  const [atualizado] = await repo.listarPerfis()
  assert.equal(atualizado.xp, 30)
  assert.equal(atualizado.coins, 20)

  const ultima = await repo.ultimaTentativa(perfil.id, 'mat3-mult-m1')
  assert.ok(ultima.concluida_em)
  assert.equal(ultima.acertos, 5)

  assert.deepEqual(await repo.missoesConcluidas(perfil.id), ['mat3-mult-m1'])

  const semanal = await repo.carregarRanking('semanal')
  assert.equal(semanal.length, 1)
  assert.equal(semanal[0].child_id, perfil.id)
  assert.equal(semanal[0].xp_total, 30)
  assert.equal(semanal[0].children.nickname, 'Bia')

  for (const periodo of ['mensal', 'global']) {
    const linhas = await repo.carregarRanking(periodo)
    assert.equal(linhas[0]?.xp_total, 30, `ranking ${periodo}`)
  }
})

test('concluir a mesma tentativa duas vezes não paga XP duas vezes', async () => {
  const perfil = await comPerfil()
  const id = await repo.iniciarTentativa({ crianca_id: perfil.id, missao_id: 'm', total: 1 })

  await repo.concluirTentativa(id, { acertos: 1, total: 1, xp: 10, moedas: 4 })
  await repo.concluirTentativa(id, { acertos: 1, total: 1, xp: 10, moedas: 4 })

  const [atualizado] = await repo.listarPerfis()
  assert.equal(atualizado.xp, 10)
  assert.equal(atualizado.coins, 4)
})

test('relatório dos pais sai das tentativas concluídas', async () => {
  const perfil = await comPerfil()
  await repo.enviarTentativa({
    crianca_id: perfil.id,
    missao_id: 'mat3-mult-m1',
    acertos: 4,
    total: 5,
    xp_ganho: 20,
    moedas_ganhas: 16,
  })

  const semanal = await repo.relatorioPais(perfil.id, 'semanal')
  assert.equal(semanal.total_missoes, 1)
  assert.equal(semanal.total_dias, 1)
  assert.equal(semanal.total_xp, 20)
  // A tela multiplica por 100: aqui a taxa é fração (4 de 5).
  assert.equal(semanal.taxa_acerto, 0.8)
  assert.equal(Object.keys(semanal.constancia).length, 7)
  assert.ok(semanal.streak_atual >= 1)

  // Perfil sem tentativas: zeros, nunca NaN.
  const outro = await comPerfil({ nickname: 'Gui' })
  const vazio = await repo.relatorioPais(outro.id, 'mensal')
  assert.equal(vazio.total_missoes, 0)
  assert.equal(vazio.taxa_acerto, 0)
})

test('ranking esconde quem desligou a privacidade', async () => {
  const bia = await comPerfil()
  const gui = await comPerfil({ nickname: 'Gui' })

  const idBia = await repo.iniciarTentativa({ crianca_id: bia.id, missao_id: 'm', total: 1 })
  await repo.concluirTentativa(idBia, { xp: 10 })
  const idGui = await repo.iniciarTentativa({ crianca_id: gui.id, missao_id: 'm', total: 1 })
  await repo.concluirTentativa(idGui, { xp: 50 })

  // Gui desliga a privacidade depois de já ter XP.
  const perfis = JSON.parse(localStorage.getItem('kids_play_perfis_v1'))
  perfis.find((p) => p.id === gui.id).mostrar_no_ranking = false
  localStorage.setItem('kids_play_perfis_v1', JSON.stringify(perfis))

  const ranking = await repo.carregarRanking('global')
  assert.deepEqual(ranking.map((r) => r.child_id), [bia.id])
})
