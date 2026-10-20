// Implementação LOCAL do repositório: localStorage + conteúdo embarcado.
//
// Nenhuma requisição de rede acontece aqui. As chaves de localStorage são as
// mesmas já usadas pelo app (spec §5), para reaproveitar o que existia.
import conteudo from '../../data/conteudo-local.json' with { type: 'json' }
import { montarRanking, calcularRelatorio } from './logica-local.mjs'

const CHAVE_PERFIS = 'kids_play_perfis_v1'
const CHAVE_RANKS = 'kids_play_ranks_v1'
const CHAVE_TENTATIVAS = 'kids_play_tentativas_offline'

// Não há conta no modo local: quem abre o app já está "dentro".
const USUARIO_LOCAL = { id: 'local', email: 'Modo local' }

// Uma única matéria embarcada, montada aqui porque o JSON só guarda o id.
const MATERIA_LOCAL = {
  id: 'local-mat',
  nome: 'Matemática',
  icone: '🔢',
  cor: '#0d9488',
}

function ler(chave, padrao) {
  try {
    if (typeof localStorage === 'undefined') return padrao
    const cru = localStorage.getItem(chave)
    return cru ? JSON.parse(cru) : padrao
  } catch {
    // localStorage cheio ou em modo privado: segue sem persistir, sem quebrar.
    return padrao
  }
}

function guardar(chave, valor) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(chave, JSON.stringify(valor))
    }
  } catch {
    // ignora: ver comentário em ler()
  }
  return valor
}

function agoraISO() {
  return new Date().toISOString()
}

function novoId(prefixo) {
  const aleatorio = globalThis.crypto?.randomUUID?.()
  return `${prefixo}-${aleatorio ?? Math.random().toString(36).slice(2)}`
}

/** `school_year` do perfil é '3'; o conteúdo guarda '3º'. Compara só os dígitos. */
function apenasDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

// ---- auth ----

export async function obterUsuario() {
  return USUARIO_LOCAL
}

export async function sair() {
  // Não há sessão a encerrar: só esquecemos qual criança estava jogando.
  const { limparPerfilSelecionado } = await import('../perfil.js')
  limparPerfilSelecionado()
}

// O cliente cru não existe no modo local. Fica `null` para que as telas que
// checam `if (!cliente)` (admin, relato de erro) simplesmente pulem a chamada.
export const cliente = null

// ---- perfis ----

export async function listarPerfis() {
  return ler(CHAVE_PERFIS, []).filter((p) => p.guardian_id === 'local')
}

export async function criarPerfil({ nickname, school_year, avatar_id } = {}) {
  const perfis = ler(CHAVE_PERFIS, [])
  const perfil = {
    id: novoId('local'),
    guardian_id: 'local',
    nickname,
    school_year,
    avatar_id,
    // Defaults que o banco daria no modo online. `stage` é texto lá
    // (check: aldeia|vila|castelo|reino), então usamos o mesmo vocabulário.
    xp: 0,
    coins: 0,
    stage: 'aldeia',
    mostrar_no_ranking: true,
    mostrar_foto_no_ranking: false,
  }
  perfis.push(perfil)
  guardar(CHAVE_PERFIS, perfis)
  return perfil
}

async function atualizarPerfil(idCrianca, mutar) {
  const perfis = ler(CHAVE_PERFIS, [])
  const i = perfis.findIndex((p) => p.id === idCrianca)
  if (i < 0) return
  perfis[i] = { ...perfis[i], ...mutar(perfis[i]) }
  guardar(CHAVE_PERFIS, perfis)
}

// ---- missões ----

function missoesDoAno(ano) {
  const alvo = apenasDigitos(ano)
  if (!alvo) return []
  const faixa = (conteudo?.anos ?? []).find((a) => apenasDigitos(a.ano) === alvo)
  return faixa?.missoes ?? []
}

/**
 * Missões do ano. `materiaId` é ignorado de propósito: o conteúdo embarcado
 * tem uma única matéria. Ano sem conteúdo devolve [] (a tela mostra o aviso).
 */
export async function carregarMissoes(ano) {
  return missoesDoAno(ano).map((m) => ({
    id: m.id,
    titulo: m.titulo,
    descricao: m.descricao,
    dificuldade: m.dificuldade,
    ordem: m.ordem,
    concluida_por: [],
    disponivel_para: null,
  }))
}

export async function carregarMissaoComPerguntas(idMissao) {
  for (const faixa of conteudo?.anos ?? []) {
    const m = (faixa.missoes ?? []).find((x) => x.id === idMissao)
    if (!m) continue
    return {
      ...m,
      // O online traz a matéria junto; MissaoNova lê `materias.nome`.
      materias: MATERIA_LOCAL,
      perguntas: [...(m.perguntas ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    }
  }
  return null
}

/** Ids das missões com tentativa concluída (para o mapa de desbloqueio). */
export async function missoesConcluidas(idCrianca) {
  const concluidas = ler(CHAVE_TENTATIVAS, [])
    .filter((t) => t.crianca_id === idCrianca && t.concluida_em)
    .map((t) => t.missao_id)
  return [...new Set(concluidas)]
}

export async function ultimaTentativa(idCrianca, idMissao) {
  const todas = ler(CHAVE_TENTATIVAS, [])
  return (
    todas
      .filter((t) => t.crianca_id === idCrianca && t.missao_id === idMissao)
      .sort((a, b) => String(b.iniciada_em).localeCompare(String(a.iniciada_em)))[0] ?? null
  )
}

// ---- ciclo da tentativa ----

export async function iniciarTentativa(campos = {}) {
  const todas = ler(CHAVE_TENTATIVAS, [])
  const registro = {
    id: novoId('tent'),
    iniciada_em: agoraISO(),
    concluida_em: null,
    acertos: 0,
    total: 0,
    xp_ganho: 0,
    moedas_ganhas: 0,
    refeita: false,
    ...campos,
  }
  todas.push(registro)
  guardar(CHAVE_TENTATIVAS, todas)
  return registro.id
}

export async function concluirTentativa(id, res = {}) {
  const todas = ler(CHAVE_TENTATIVAS, [])
  const i = todas.findIndex((t) => t.id === id)
  if (i < 0) return
  // Concluir duas vezes não pode pagar XP duas vezes.
  if (todas[i].concluida_em) return

  todas[i] = {
    ...todas[i],
    concluida_em: agoraISO(),
    acertos: Number(res.acertos) || 0,
    total: Number(res.total) || 0,
    xp_ganho: Number(res.xp) || 0,
    moedas_ganhas: Number(res.moedas) || 0,
    refeita: Boolean(res.refeita),
  }
  guardar(CHAVE_TENTATIVAS, todas)
  await aplicarRecompensas(todas[i])
}

/** Caminho legado: registra a tentativa já concluída de uma vez. */
export async function enviarTentativa(tentativa = {}) {
  const todas = ler(CHAVE_TENTATIVAS, [])
  const registro = {
    iniciada_em: agoraISO(),
    acertos: 0,
    total: 0,
    xp_ganho: 0,
    moedas_ganhas: 0,
    refeita: false,
    ...tentativa,
    id: tentativa.id ?? novoId('tent'),
    concluida_em: tentativa.concluida_em ?? agoraISO(),
  }
  todas.push(registro)
  guardar(CHAVE_TENTATIVAS, todas)
  await aplicarRecompensas(registro)
  return { enviado: true, tipo: 'local' }
}

/**
 * As respostas pergunta a pergunta não são guardadas no modo local: nada as
 * consome offline (o relatório sai das tentativas). Mantemos a função para o
 * contrato do repositório e para o useMissao não precisar de outro caminho.
 */
export async function enviarRespostas() {
  return { enviado: true, tipo: 'local' }
}

// ---- progresso ----

export async function somarXP(idCrianca, xp) {
  const valor = Number(xp) || 0
  if (!idCrianca || !valor) return
  await atualizarPerfil(idCrianca, (p) => ({ xp: (Number(p.xp) || 0) + valor }))
}

export async function somarMoedas(idCrianca, quantidade) {
  const valor = Number(quantidade) || 0
  if (!idCrianca || !valor) return
  await atualizarPerfil(idCrianca, (p) => ({ coins: (Number(p.coins) || 0) + valor }))
}

/** XP da missão vai para o perfil E para a linha de ranking, sempre juntos. */
async function aplicarRecompensas(tentativa) {
  const idCrianca = tentativa?.crianca_id
  if (!idCrianca) return
  const xp = Number(tentativa.xp_ganho) || 0
  const moedas = Number(tentativa.moedas_ganhas) || 0
  await somarXP(idCrianca, xp)
  await somarMoedas(idCrianca, moedas)
  await somarRanking(idCrianca, xp)
}

async function somarRanking(idCrianca, xp) {
  const valor = Number(xp) || 0
  if (!idCrianca || !valor) return

  const hoje = new Date()
  const { semanaDoAno } = await import('./logica-local.mjs')
  const semana = semanaDoAno(hoje)
  const mes = hoje.getMonth() + 1
  const ano = hoje.getFullYear()

  const linhas = ler(CHAVE_RANKS, [])
  for (const periodo of ['semanal', 'mensal', 'global']) {
    const i = linhas.findIndex(
      (l) =>
        l.child_id === idCrianca &&
        l.periodo === periodo &&
        l.ano === ano &&
        (periodo === 'global'
          ? true
          : periodo === 'semanal'
            ? l.semana === semana
            : l.mes === mes),
    )
    if (i >= 0) {
      linhas[i] = { ...linhas[i], xp_total: (Number(linhas[i].xp_total) || 0) + valor }
    } else {
      linhas.push({ child_id: idCrianca, periodo, ano, semana, mes, xp_total: valor })
    }
  }
  guardar(CHAVE_RANKS, linhas)
}

// ---- ranking e relatório ----

export async function carregarRanking(periodo) {
  return montarRanking(ler(CHAVE_RANKS, []), {
    periodo,
    agora: new Date(),
    perfis: ler(CHAVE_PERFIS, []),
  })
}

export async function relatorioPais(idCrianca, periodo = 'semanal') {
  if (!idCrianca) return null
  const perfis = ler(CHAVE_PERFIS, [])
  const perfil = perfis.find((p) => p.id === idCrianca)
  const daCrianca = ler(CHAVE_TENTATIVAS, []).filter((t) => t.crianca_id === idCrianca)
  // `periodo` é respeitado aqui, diferente do RPC online (ver spec §5.6).
  return calcularRelatorio(daCrianca, {
    periodo,
    agora: new Date(),
    xp: perfil?.xp ?? 0,
  })
}
