// Frases do Kapivarus para o motor de missão (FASE 3).
// Separadas das frases gerais de dica/acerto/incentivo para não misturar os contextos.

export const FRASES_BOAVINDAS = [
  (titulo) => `Vamos começar: ${titulo}. ${titulosDescricao(titulo)}`,
  'Hoje é dia de aprender sem pressa. Vamos lá!',
  'Prepare a mente: uma missão curta que vale a pena.',
]

export const FRASES_FINAL_ACERTO = [
  'Isso aí! Cada acerto te deixa mais forte!',
  'Muito bem! Você completou a missão com garra.',
  'Fantástico! Seu esforço deu resultado.',
]

export const FRASES_FINAL_INCENTIVO = [
  'Usei esforço de tudo. Vamos tentar de novo?',
  'Sem rendimento, só aprendizado. Confio em você.',
  'Quase — a próxima vez já sai melhor.',
]

// frase para boas-vindas já com descricao curta (construída no runtime quando não há)
function titulosDescricao(titulo) {
  return `Confio que você manda bem. ${titulo}`
}

export function fraseComEmbrace(titulo, descricao) {
  return `Vamos começar: ${titulo}. ${descricao}`
}
