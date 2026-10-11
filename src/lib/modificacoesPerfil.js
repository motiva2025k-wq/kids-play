// Serviços de atualização do perfil infantil (XP, moedas, estágio).
// Chamados pelo motor de missão e por futuras telas. Não altera estrutura de login/cadastro.
import { supabase } from './supabase.js'

const ESTAGIO_DELTA = [
  { minimo: 0,    stage: 'aldeia' },
  { minimo: 120,  stage: 'vila' },
  { minimo: 360,  stage: 'castelo' },
  { minimo: 720,  stage: 'reino' },
]

/** Soma XP e, se estiver num limite, sobe de estágio. */
export async function somarXP(idCrianca, xp) {
  if (!supabase || !idCrianca) return
  const { data, error } = await supabase
    .from('children')
    .select('id, xp, stage')
    .eq('id', idCrianca)
    .single()
  if (error || !data) return

  const novoXP = (data.xp ?? 0) + Math.max(0, Math.floor(xp))
  const estagioAtual =
    ESTAGIO_DELTA.findIndex((e) => (data.stage ?? 'aldeia') === e.stage) ?? 0
  const proximoEstagio = ESTAGIO_DELTA[estagioAtual + 1]
  let novoStage = data.stage
  if (proximoEstagio && novoXP >= proximoEstagio.minimo) {
    novoStage = proximoEstagio.stage
  }
  await supabase
    .from('children')
    .update({ xp: novoXP, stage: novoStage })
    .eq('id', idCrianca)
}

/** Soma moedas. */
export async function somarMoedas(idCrianca, quantidade) {
  if (!supabase || !idCrianca) return
  const { data } = await supabase
    .from('children')
    .select('id, coins')
    .eq('id', idCrianca)
    .single()
  if (!data) return
  await supabase
    .from('children')
    .update({ coins: (data.coins ?? 0) + Math.max(0, Math.floor(quantidade)) })
    .eq('id', idCrianca)
}

/** Devolve o estágio atual do perfil a partir do XP (usado pelo componente). */
export function estagioPorXP(xp = 0) {
  const n = Number(xp) || 0
  for (let i = ESTAGIO_DELTA.length - 1; i >= 0; i--) {
    if (n >= ESTAGIO_DELTA[i].minimo) return ESTAGIO_DELTA[i].stage
  }
  return 'aldeia'
}
