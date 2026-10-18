/**
 * motorMissao.mjs — lógica pura do motor de missão (sem React, sem Supabase).
 *
 * Responsabilidades:
 *   • guardar a lista de perguntas e o índice atual (uma por vez);
 *   • aplicar uma resposta (acerto/erro), contando acertos e sequência;
 *   • controlar a dica (uma por pergunta) e se a explicação foi exibida;
 *   • calcular o resultado final (percentual, estrelas, XP, moedas, refeita).
 *
 * Isolado do hook para poder ser testado no Node (scripts/testar-motor.mjs)
 * sem depender de React nem de banco. O hook useMissao usa isto por baixo.
 */

// Estrelas por desempenho (3 = perfeito; 2 = bom; 1 = passou; 0 = abaixo de 50%).
export function calcularEstrelas(percentual) {
  if (percentual >= 100) return 3
  if (percentual >= 70) return 2
  if (percentual >= 50) return 1
  return 0
}

/** XP e moedas por estrela (alinhado ao progresso.js). */
export const XP_POR_ESTRELA = 5
export const MOEDAS_POR_ESTRELA = 4
/** multiplicador quando a criança refaz a missão. */
export const FATOR_REFEITA = 0.5

/**
 * cria o estado inicial do motor a partir das perguntas.
 * @param {Array} perguntas lista de perguntas (com id, enunciado, dados, …)
 * @param {boolean} refeita se esta missão já foi concluída antes
 */
export function criarMotor(perguntas = [], { refeita = false } = {}) {
  const lista = Array.isArray(perguntas) ? perguntas : []
  return {
    perguntas: lista,
    indice: 0,
    acertos: 0,
    erros: 0,
    respostas: [],           // { pergunta_id, correta, dica_usada }
    dicaUsada: false,        // dica da pergunta atual
    dicasUsadas: 0,          // total de dicas na missão
    explicacaoExibida: false,// explicação pós-erro da pergunta atual
    refeita: !!refeita,
    finalizado: lista.length === 0,
  }
}

/** pergunta atual (ou null se acabou). */
export function perguntaAtual(estado) {
  if (estado.finalizado) return null
  return estado.perguntas[estado.indice] ?? null
}

/** total de perguntas. */
export function totalPerguntas(estado) {
  return estado.perguntas.length
}

/** posição atual (1-based) para a barra de progresso. */
export function posicaoAtual(estado) {
  return Math.min(estado.indice + 1, totalPerguntas(estado))
}

/** registra que a criança pediu a dica da pergunta atual. */
export function usarDica(estado) {
  if (estado.finalizado || estado.dicaUsada) return estado
  estado.dicaUsada = true
  estado.dicasUsadas += 1
  return estado
}

/** registra que a explicação pós-erro foi exibida na pergunta atual. */
export function marcarExplicacao(estado) {
  if (!estado.finalizado) estado.explicacaoExibida = true
  return estado
}

/**
 * aplica a resposta da pergunta atual.
 * @param {boolean} correta se acertou
 * @returns {object} { estado, evento, acertou, finalizado }
 *   `evento` é o evento do catálogo de falas a disparar:
 *   'acerto' | 'acerto_sequencia' | 'erro' | 'explicacao_apos_erro'
 */
export function responder(estado, correta) {
  if (estado.finalizado) return { estado, evento: null, acertou: false, finalizado: true }

  const pergunta = perguntaAtual(estado)
  const acertou = correta === true

  // registra a resposta desta pergunta
  estado.respostas.push({
    pergunta_id: pergunta?.id ?? null,
    correta: acertou,
    dica_usada: estado.dicaUsada,
  })

  if (acertou) {
    estado.acertos += 1
    // 3 acertos seguidos → acerto_sequencia
    const ultimosTres = estado.respostas.slice(-3)
    const sequencia = ultimosTres.length === 3 && ultimosTres.every((r) => r.correta)
    var evento = sequencia ? 'acerto_sequencia' : 'acerto'
  } else {
    estado.erros += 1
    // erro → mostra a explicação → evento explicacao_apos_erro
    estado.explicacaoExibida = true
    var evento = 'explicacao_apos_erro'
  }

  // passa para a próxima pergunta (reseta dica/explicação da atual)
  estado.indice += 1
  estado.dicaUsada = false
  estado.explicacaoExibida = false
  estado.finalizado = estado.indice >= totalPerguntas(estado)

  return { estado, evento, acertou, finalizado: estado.finalizado }
}

/**
 * calcula o resultado final ao terminar a missão.
 * @returns {object} { acertos, total, percentual, estrelas, xp, moedas, refeita }
 */
export function calcularResultado(estado) {
  const total = totalPerguntas(estado)
  const acertos = estado.acertos
  const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
  const estrelas = calcularEstrelas(percentual)

  const fator = estado.refeita ? FATOR_REFEITA : 1
  const xp = Math.round(estrelas * XP_POR_ESTRELA * fator)
  const moedas = Math.round(estrelas * MOEDAS_POR_ESTRELA * fator)

  return { acertos, total, percentual, estrelas, xp, moedas, refeita: estado.refeita }
}
