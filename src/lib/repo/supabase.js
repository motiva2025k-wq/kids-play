// Implementação SUPABASE do repositório.
//
// Decisão de desenho: em vez de MOVER o código de `lib/missoes.js` e de
// `lib/modificacoesPerfil.js` para cá, este arquivo re-exporta o que já
// existe e só acrescenta o que faltava (perfis, auth, ranking, relatório e
// o ciclo da tentativa). Assim o comportamento online fica byte a byte o
// mesmo e o diff é pequeno — menos risco de regressão.
import { supabase } from '../supabase.js'
import { semanaDoAno } from './logica-local.mjs'
import {
  carregarMissoes,
  carregarMissaoComPerguntas,
  ultimaTentativa,
  enviarTentativa,
  enviarRespostas,
} from '../missoes.js'
import { somarXP, somarMoedas } from '../modificacoesPerfil.js'

export {
  carregarMissoes,
  carregarMissaoComPerguntas,
  ultimaTentativa,
  enviarTentativa,
  enviarRespostas,
  somarXP,
  somarMoedas,
}

// O cliente cru continua disponível para as telas que precisam falar com o
// Supabase diretamente (admin, relato de erro). No modo local ele é null.
export { supabase as cliente }

// ---- auth ----
// No modo Supabase a sessão vem do AuthContext; o repo só expõe as
// operações que as telas chamam.

export async function obterUsuario() {
  const { data } = (await supabase?.auth?.getUser?.()) ?? { data: { user: null } }
  return data?.user ?? null
}

export async function sair() {
  await supabase?.auth?.signOut?.()
}

// ---- perfis ----

export async function listarPerfis() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('children')
    .select('id, nickname, school_year, avatar_id, xp, coins, stage, mostrar_no_ranking')
    .order('created_at')
  if (error) throw error
  return data ?? []
}

export async function criarPerfil(dados) {
  if (!supabase) throw new Error('Sem conexão com o banco de dados.')
  const { error } = await supabase.from('children').insert(dados)
  if (error) throw new Error('Não deu para salvar o perfil. Tente de novo.')
  return true
}

// ---- ciclo da tentativa ----
// Extraído do useMissao para que o modo local também consiga gravar.

export async function iniciarTentativa(campos) {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('tentativas_missao')
    .insert(campos)
    .select('id')
    .single()
  if (error || !data?.id) {
    console.warn('[tentativas] não deu pra criar:', error?.message)
    return null
  }
  return data.id
}

export async function concluirTentativa(id, res) {
  if (!supabase || !id) return
  const { error } = await supabase
    .from('tentativas_missao')
    .update({
      concluida_em: new Date().toISOString(),
      acertos: res.acertos,
      total: res.total,
      xp_ganho: res.xp,
      moedas_ganhas: res.moedas,
      refeita: res.refeita,
    })
    .eq('id', id)
  if (error) console.warn('[tentativas] não deu pra concluir:', error?.message)
}

// ---- ranking ----

export async function carregarRanking(periodo) {
  if (!supabase) return []
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const semana = semanaDoAno(hoje)
  const mes = hoje.getMonth() + 1

  let query = supabase
    .from('ranks')
    .select(`
      *,
      children (
        id,
        nickname,
        avatar_id,
        mostrar_no_ranking,
        mostrar_foto_no_ranking
      )
    `)
    .eq('periodo', periodo)
    .eq('ano', ano)

  if (periodo === 'semanal') query = query.eq('semana', semana)
  else if (periodo === 'mensal') query = query.eq('mes', mes)

  const { data, error } = await query.order('posicao', { ascending: true })
  if (error) throw error
  return (data ?? []).filter((r) => r.children?.mostrar_no_ranking !== false)
}

// ---- relatório dos pais ----

export async function relatorioPais(idCrianca, periodo = 'semanal') {
  if (!supabase || !idCrianca) return null
  const { data, error } = await supabase.rpc('relatorio_pais', {
    child_id_param: idCrianca,
    periodo,
  })
  if (error) throw error
  return data && data[0] ? data[0] : null
}
