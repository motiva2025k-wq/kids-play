/**
 * testar-falas.mjs — verifica as regras do módulo de falas (falas.mjs).
 * Sem dependências: roda com `node scripts/testar-falas.mjs`.
 *
 * Cobre: substituição de variáveis, não repetir a seguida, fallback sem
 * variáveis faltando, evento inexistente, intervalo mínimo do toque.
 */

// shim de localStorage para o módulo de progresso (Node não tem)
if (typeof globalThis.localStorage === 'undefined') {
  const mem = new Map()
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
  }
}

import {
  dizer,
  dizerAoAcordar,
  estadoDe,
  efeitoDe,
  existeEvento,
  podeTocar,
  podeFalarOcioso,
  registrarOcioso,
  resetarToques,
  resetarOciosos,
  regras,
} from '../src/components/kapivarus/falas.mjs'
import {
  carregarProgresso,
  aplicarResultadoMissao,
  registrarDiaJogado,
  atualizarDia,
  XP_POR_NIVEL,
  XP_POR_ESTRELA,
  META_DIARIA_XP,
} from '../src/lib/progresso.js'

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

// 1) substituição de variáveis
const ctx = { nome: 'Ana', xp: 120, nivel: 4, moedas: 30, missoes: 9 }
const falaAcerto = dizer('acerto', ctx)
ok(
  !/\{(nome|xp|nivel|dias|moedas|missoes)\}/.test(falaAcerto.texto),
  'acerto: nenhuma variável sobra quebrada → "' + falaAcerto.texto + '"',
)
ok(falaAcerto.estado && falaAcerto.efeito, 'acerto devolve estado e efeito')

// 2) não repetir a fala do mesmo evento em sequência (consecutiva)
let repetiuConsecutiva = false
let anterior = ''
for (let i = 0; i < 30; i++) {
  const t = dizer('acerto', ctx).texto
  if (t === anterior) repetiuConsecutiva = true
  anterior = t
}
ok(!repetiuConsecutiva, 'acerto: nunca repete a mesma fala 2× seguidas (30 sorteios)')

// 3) fallback sem variáveis faltando: {xp} sem contexto → outra fala (sem quebrar)
const semXp = dizer('missao_concluida', { nome: 'Bia' })
ok(
  !/\{xp\}/.test(semXp.texto),
  'missao_concluida sem {xp}: escolhe fala sem a variável → "' + semXp.texto + '"',
)

// 4) evento inexistente → fala padrão, sem lançar
let lancou = false
let falaDesconhecida
try {
  falaDesconhecida = dizer('evento_que_nao_existe', { nome: 'Ana' })
} catch {
  lancou = true
}
ok(!lancou, 'evento inexistente não lança exceção')
ok(
  typeof falaDesconhecida?.texto === 'string' && falaDesconhecida.texto.length > 0,
  'evento inexistente devolve fala padrão',
)

// 5) estado/efeito conhecidos
ok(estadoDe('ranking') === 'trono', 'estadoDe(ranking) = trono')
ok(efeitoDe('acerto_sequencia') === 'confete', 'efeitoDe(acerto_sequencia) = confete')
ok(existeEvento('volta_apos_dias'), 'existeEvento(volta_apos_dias)')
ok(!existeEvento('invented'), '!existeEvento(invented)')

// 6) volta_apos_dias → dormindo e acorda com estado_ao_tocar
ok(estadoDe('volta_apos_dias') === 'dormindo', 'volta_apos_dias começa dormindo')
const aoAcordar = dizerAoAcordar({ nome: 'Ana' })
ok(aoAcordar.estado === 'feliz', 'dizerAoAcordar muda para feliz')

// 7) intervalo mínimo do toque
resetarToques()
ok(podeTocar() === true, '1º toque passa')
ok(podeTocar() === false, 'toque imediato seguinte é bloqueado (intervalo mínimo)')
await new Promise((r) => setTimeout(r, Number(regras().intervalo_minimo_toque_ms) + 20))
ok(podeTocar() === true, 'toque após o intervalo mínimo passa de novo')

// 8) ocioso: no máximo ocioso_max_por_tela vezes, e nunca com atividade
resetarOciosos()
const max = Number(regras().ocioso_max_por_tela) || 1
ok(podeFalarOcioso({ atividadeEmAndamento: false }) === true, '1º ocioso permitido')
registrarOcioso()
for (let i = 0; i < max + 2; i++) registrarOcioso()
ok(podeFalarOcioso({ atividadeEmAndamento: false }) === false, 'ocioso respeita o teto por tela')
resetarOciosos()
ok(
  podeFalarOcioso({ atividadeEmAndamento: true }) === false,
  'ocioso nunca fala com atividade em andamento',
)

// 9) progresso: XP/estrela e subir de nível
const r1 = aplicarResultadoMissao({ estrelas: 3 }) // +15 XP → nível 1 ainda
ok(r1.progresso.xp === 3 * XP_POR_ESTRELA, 'progresso: 3 estrelas = ' + 3 * XP_POR_ESTRELA + ' XP')
ok(r1.subiuDeNivel === false, 'progresso: 15 XP não sobe do nível 1')
// força a subir de nível: aplica o suficiente
let subiu = false
let atual = r1.progresso
for (let i = 0; i < Math.ceil(XP_POR_NIVEL / (XP_POR_ESTRELA * 3)) + 1 && !subiu; i++) {
  const r = aplicarResultadoMissao({ estrelas: 3 })
  subiu = r.subiuDeNivel
  atual = r.progresso
}
ok(subiu, 'progresso: após XP suficiente, sobe de nível')
ok(atual.nivel >= 2, 'progresso: nível >= 2 após subir')

// 10) progresso: meta do dia (zera antes para isolar o teste)
globalThis.localStorage.removeItem('kids_play_progresso_v1')
const rMeta = aplicarResultadoMissao({ estrelas: 6 }) // 30 XP num só golpe
ok(rMeta.metaDoDia === true, 'progresso: 30 XP numa missão bate a meta do dia')
// segunda missão no mesmo dia não re-bate a meta
const rMeta2 = aplicarResultadoMissao({ estrelas: 6 })
ok(rMeta2.metaDoDia === false, 'progresso: meta do dia não repete no mesmo dia')

// 11) progresso: dias seguidos (streak)
atualizarDia()
globalThis.localStorage.removeItem('kids_play_progresso_v1')
const d1 = registrarDiaJogado()
ok(d1.diasSeguidos === 1, 'progresso: primeiro dia = 1')
const d2 = registrarDiaJogado() // mesmo dia
ok(d2.diasSeguidos === 1 && d2.novoMarco === false, 'progresso: mesmo dia não incrementa')

console.log('')
if (erros === 0) {
  console.log('Tudo certo — regras do catálogo de falas verificadas (' + oks + ' ok).')
} else {
  console.error(erros + ' ponto(s) com problema.')
}
process.exit(erros === 0 ? 0 : 1)
