// Serviço de missões do Kids_Play (FASE 3).
// Separa leitura (qualquer usuário logado) de escrita (apenas a própria criança).
import { supabase } from './supabase.js'

// ---------- leitura ----------

/** Missões ativas do ano da criança, em ordem, sem expor conteúdo de perguntas. */
export async function carregarMissoes(ano, materiaId) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('missoes')
    .select('id, titulo, descricao, dificuldade, ordem, concluida_por, disponivel_para')
    .eq('ano', ano)
    .eq('ativa', true)
    .eq('materia_id', materiaId)
    .order('ordem')
  if (error) {
    console.error('[missoes] erro ao carregar:', error)
    return []
  }
  return data ?? []
}

/** Detalhes da missão + perguntas já embaralhadas, mas sem expor a resposta correta
 *  em claro onde o tipo dá para deduzir (veja a seção "respostas" abaixo).
 */
export async function carregarMissaoComPerguntas(idMissao) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('missoes')
    .select(`
      id,
      titulo,
      descricao,
      dificuldade,
      materias (
        id,
        nome,
        icone,
        cor
      )
    `)
    .eq('id', idMissao)
    .single()
  if (error || !data) {
    console.error('[missao] não encontrada:', error)
    return null
  }

  const { data: perguntas } = await supabase
    .from('perguntas')
    .select('id, tipo, enunciado, dados, dica, explicacao, ordem')
    .eq('missao_id', idMissao)
    .order('ordem')
  if (perguntas && perguntas.length) {
    data.perguntas = perguntas
  }
  return data
}

/** Última tentativa (ou nula) da criança para esta missão. */
export async function ultimaTentativa(idCrianca, idMissao) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('tentativas_missao')
    .select('id, iniciada_em, concluida_em, acertos, total, xp_ganho, moedas_ganhas, refeita')
    .eq('crianca_id', idCrianca)
    .eq('missao_id', idMissao)
    .order('iniciada_em', { ascending: false })
    .limit(1)
  if (error) {
    console.error('[tentativas] erro ao carregar:', error)
    return null
  }
  return (data ?? [])[0] ?? null
}

/** Missões já concluídas pela criança (para o mapa de desbloqueio). */
export async function missoesConcluidas(idCrianca) {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('tentativas_missao')
    .select('missao_id')
    .eq('crianca_id', idCrianca)
    .not('concluida_em', 'is', null)
    .order('created_at')
  if (error) {
    console.error('[tentativas] erro ao listar concluídas:', error)
    return []
  }
  // set de ids concluídos
  return [...new Set((data ?? []).map((t) => t.missao_id))]
}

// ---------- escrita (apenas a própria criança) ----------

const MAX_REENVIO = 3
const ESPERA_REENVIO = [1000, 2500, 5000]

/** Envia uma tentativa com retry e fallback local (sessionStorage) caso caia. */
export async function enviarTentativa(tentativa) {
  if (!supabase) return { enviado: false, tipo: 'off' }

  for (let i = 0; i < MAX_REENVIO; i++) {
    const { error } = await supabase.from('tentativas_missao').insert(tentativa)
    if (!error) return { enviado: true, tipo: 'online' }
    console.warn('[tentativas] reenvio', i + 1, error?.message)
    if (i < MAX_REENVIO - 1) await dormir(ESPERA_REENVIO[i])
  }

  // fallback local para reenvio no inicio da próxima sessão
  guardarLocal(tentativa)
  return { enviado: false, tipo: 'offline_guardado' }
}

/** Envia respostas de uma tentativa já criada. */
export async function enviarRespostas(respostas) {
  if (!supabase) return { enviado: false, tipo: 'off' }
  for (let i = 0; i < MAX_REENVIO; i++) {
    const { error } = await supabase.from('respostas').insert(respostas)
    if (!error) return { enviado: true, tipo: 'online' }
    console.warn('[respostas] reenvio', i + 1, error?.message)
    if (i < MAX_REENVIO - 1) await dormir(ESPERA_REENVIO[i])
  }
  guardarLocalRespostas(respostas)
  return { enviado: false, tipo: 'offline_guardado' }
}

async function dormir(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ---------- fallback local (sessionStorage) ----------

const CHAVE_TENTATIVAS = 'kids_play_tentativas_offline'
const CHAVE_RESPOSTAS = 'kids_play_respostas_offline'

function guardarLocal(tentativa) {
  try {
    const ja = JSON.parse(sessionStorage.getItem(CHAVE_TENTATIVAS) ?? '[]')
    sessionStorage.setItem(
      CHAVE_TENTATIVAS,
      JSON.stringify([...ja, tentativa]),
    )
  } catch (e) {
    console.warn('[offline] não deu pra guardar tentativa local:', e)
  }
}

function guardarLocalRespostas(respostas) {
  try {
    const ja = JSON.parse(sessionStorage.getItem(CHAVE_RESPOSTAS) ?? '[]')
    sessionStorage.setItem(
      CHAVE_RESPOSTAS,
      JSON.stringify([...ja, ...respostas]),
    )
  } catch (e) {
    console.warn('[offline] não deu pra guardar respostas local:', e)
  }
}

/** Tenta reenviar o que ficou pendente no sessionStorage.
 *  Chame no início da sessão de missão, depois da criança escolhida.
 */
export async function reenviarPendente(idCrianca) {
  const pendentes = carregarPendentes()
  if (!pendentes.tentativas.length && !pendentes.respostas.length) return 0
  let enviados = 0
  for (const t of pendentes.tentativas) {
    // só reenvia se pertencer à criança atual
    if (String(t.crianca_id) !== String(idCrianca)) continue
    const r = await enviarTentativa(t)
    if (r.enviado) {
      enviados++
      removerLocalTentativa(t.id)
    }
  }
  for (const r of pendentes.respostas) {
    if (String(r.tentativa_id) !== String(idCrianca)) continue
    const rr = await enviarRespostas([r])
    if (rr.enviado) {
      enviados++
      removerLocalResposta(r.id)
    }
  }
  return enviados
}

function carregarPendentes() {
  try {
    return {
      tentativas: JSON.parse(sessionStorage.getItem(CHAVE_TENTATIVAS) ?? '[]'),
      respostas: JSON.parse(sessionStorage.getItem(CHAVE_RESPOSTAS) ?? '[]'),
    }
  } catch {
    return { tentativas: [], respostas: [] }
  }
}

function removerLocalTentativa(id) {
  try {
    const ja = JSON.parse(sessionStorage.getItem(CHAVE_TENTATIVAS) ?? '[]')
    sessionStorage.setItem(
      CHAVE_TENTATIVAS,
      JSON.stringify(ja.filter((t) => String(t.id) !== String(id))),
    )
  } catch {}
}

function removerLocalResposta(id) {
  try {
    const ja = JSON.parse(sessionStorage.getItem(CHAVE_RESPOSTAS) ?? '[]')
    sessionStorage.setItem(
      CHAVE_RESPOSTAS,
      JSON.stringify(ja.filter((r) => String(r.id) !== String(id))),
    )
  } catch {}
}
