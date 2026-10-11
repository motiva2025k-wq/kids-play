// Frases gentis para KapivarusFala
// Sempre incentivadoras, nunca punitivas.

export const FRASES_DICA = [
  "Vamos ler com calma. Cada pedacinho ajuda!",
  "Que tal olhar de novo, passo a passo?",
  "Essa é uma boa hora pra respirar fundo!",
  "Vamos pensar juntos. Qual pista você vê?",
  "Não precisa correr. O importante é entender!",
  "Um pequeno passo já nos leva lá!",
  "Vamos organizar as ideias com calma!",
  "Você está no caminho certo. Continue explorando!",
  "Que tal tentar por outro ângulo?",
  "Calma nessa trilha! Vamos juntos nessa!",
  "Pense devagar. A resposta aparece!",
  "Estou aqui pra te ajudar no que precisar!",
  "Vamos dividir em partes pra ficar mais fácil!",
  "Boa pergunta! Vamos buscar a resposta juntos!",
  "Muita calma no raciocínio. Vamos seguir!",
]

export const FRASES_ACERTO = [
  "Isso mesmo! Muito bem!",
  "Ótimo raciocínio! Você acertou!",
  "Parabéns! Seu esforço deu certo!",
  "Perfeito! Você está mandando muito bem!",
  "Boa! Acertou na mosca!",
  "Que legal! Você descobriu a resposta!",
  "Muito bom! Seu cérebro brilhou aí!",
  "Isso aí! Cada acerto te deixa mais forte!",
  "Excelente! Fico muito feliz por você!",
  "Acertou com maestria! Parabéns!",
  "Show de bola! Você conseguiu!",
  "Muito bem pensado! Acertou direitinho!",
  "Sensacional! Você está evoluindo muito!",
  "Top demais! Parabéns pelo acerto!",
  "Isso mesmo! Orgulho do seu esforço!",
]

export const FRASES_INCENTIVO = [
  "Quase lá! Vamos tentar de novo juntos?",
  "Foi por pouco! Tentamos mais uma vez com calma?",
  "Tá no caminho! Vamos ajustar só um detalhe!",
  "Errou por um fio! Vamos tentar de novo!",
  "Quase acertou! Vamos relembrar juntos?",
  "O esforço conta muito. Vamos tentar outra vez!",
  "Você está quase lá. Respira e tenta de novo!",
  "Isso acontece! Vamos aprender juntos!",
  "Quase! Com um pouco de calma dá certo!",
  "Não desista! Vamos dar mais um passinho!",
  "Foi muito perto! Vamos tentar com outro ângulo?",
  "Seu esforço vale a pena. Vamos tentar de novo!",
  "Quase lá! Um novo palpite pode funcionar!",
  "Vamos juntos! Mais uma tentativa com calma!",
  "Você aprende tentando. Vamos lá de novo!",
]

export function pegarFraseAleatoria(tom = "dica") {
  if (tom === "acerto") return FRASES_ACERTO[Math.floor(Math.random() * FRASES_ACERTO.length)]
  if (tom === "incentivo") return FRASES_INCENTIVO[Math.floor(Math.random() * FRASES_INCENTIVO.length)]
  return FRASES_DICA[Math.floor(Math.random() * FRASES_DICA.length)]
}
