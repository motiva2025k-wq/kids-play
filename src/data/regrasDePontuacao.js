// Pontuação do Kids_Play — alterável sem mexer nos componentes.
// Regras fixadas no enunciado da FASE 3.

/** XP por acerto, em função do contexto da tentativa.
 *  'primeira' = acertou sem antes errar essa pergunta
 *  'dica'     = acertou depois de usar a dica (mas sem antes errar)
 *  'apos_erro' = acertou após uma ou duas tentativas erradas
 */
export const XP_POR_ACERTO = {
  primeira: 10,
  dica: 6,
  apos_erro: 3,
}

/** Bônus que só entram quando a missão é concluída. */
export const BONUS_MISSAO = {
  concluida: 20,
  percentual_perfeito: 10, // 100% de acertos na tentativa final
}

/** Conversão de XP para moedas (1 moeda a cada N XP). */
export const MOEDAS_POR_XP = 10

/** Estrelas por percentual de acerto na tentativa final. */
export const ESTRELAS_POR_PERCENTUAL = [
  { minimo: 0.90, estrelas: 3 },
  { minimo: 0.60, estrelas: 2 },
  { minimo: 0, estrelas: 1 },
]

/** Quando uma missão é refeita, o bônus e o XP de acerto valem metade. */
export const XP_REPETICAO = '50%'

/** Limites de tamanho da missão (TDAH: missão curta). */
export const LIMITE_PERGUNTAS = {
  min: 5,
  max: 8,
}

/** Número máximo de tentativas por pergunta antes de mostrar a resposta. */
export const MAX_TENTATIVAS_POR_PERGUNTA = 3

/** Intervalo, em milissegundos, usado para calcular tempo por pergunta.
 *  Não é usado para punir; serve apenas para fins de análise no modo Reforço.
 */
export const TEMPO_ENCERRAMENTO = 15 * 60 * 1000 // 15 min por sessão, só como guarda
