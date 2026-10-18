// Falas do Kapivarus para a loja e a lista de desejos.
// O formato segue a mesma estrutura do catálogo `kapivarus-falas.json`.
// Cada evento pode ter várias respostas; a função `dizer` escolhe uma
// de forma aleatória e preenche o contexto das variáveis.

export const falasLoja = {
  loja_entrada: [
    {
      texto: 'Olá! Aqui você pode trocar o que está acumulando! Que bom ter você na loja.',
      estado: 'feliz',
    },
    {
      texto: 'Vish, a lojinha abriu! Tem um petisco que vai combinar.',
      estado: 'pensando',
    },
    {
      texto: 'Bem-vindo(a) à loja! Au au au, a gente vai usar tudo essa semana?',
      estado: 'incentivando',
    },
  ],

  compra_feita: [
    {
      texto: 'Comprou! Pronto, essa peça não vai sair de ti um momento.',
      estado: 'feliz',
    },
    {
      texto: 'Ótimo! Agora a sala fica mais bonita ainda. Parabéns!',
      estado: 'comemorando',
    },
    {
      texto: 'Compra feita! Você é de quem ganha rápido.',
      estado: 'incentivando',
    },
  ],

  sem_moedas_suficientes: [
    {
      texto: 'Ainda não tem essas moedas. Toma uma outra, a gente percebe quando a criança não tem.',
      estado: 'pensando',
    },
    {
      texto: 'Essa peça é um pouco carinha hoje. Mas se você se esforçar, vai garantir!',
      estado: 'incentivando',
    },
    {
      texto: 'Ainda não tem moedas suficientes. Nada de culpa, a gente tenta outra no dia seguinte.',
      estado: 'neutro',
    },
  ],

  item_bloqueado: [
    {
      texto: 'Essa peça está reservada para quem alcançar o próximo nível. Toma um ótimo e volta quando estiver pronto.',
      estado: 'pensando',
    },
    {
      texto: 'Esse item só sai pra quem tem o nível certo! A gente te ajuda a chegar.',
      estado: 'incentivando',
    },
    {
      texto: 'Ainda não é o seu momento. Mas não desanima: o aprendizado é o caminho.',
      estado: 'neutro',
    },
  ],

  item_equipado: [
    {
      texto: 'Equipou! Agora o seu perfil é o cara. Tá de parabéns!',
      estado: 'feliz',
    },
    {
      texto: 'Deu certo! O item vai seguir você em toda aventura.',
      estado: 'comemorando',
    },
    {
      texto: 'Equipar feito! Parece que o kapivarus saiu pra aplausar.',
      estado: 'feliz',
    },
  ],

  lista_desejos_cumprida: [
    {
      texto: 'Parei de sonhar, comecei a ter! Essa peça estava esperando por você.',
      estado: 'feliz',
    },
    {
      texto: 'Maravilha! A lista de desejos está ficando um pouco mais bonita.',
      estado: 'comemorando',
    },
    {
      texto: 'Aqui vai: você seguiu o objetivo e tudo aconteceu.',
      estado: 'incentivando',
    },
  ],
}

export function falarEvento(evento = '', contexto = {}) {
  const opcoes = falasLoja[evento]
  if (!Array.isArray(opcoes) || opcoes.length === 0) return { texto: '', estado: 'neutro' }

  const pesquisa = opcoes.find(
    (item) => item.texto.toLowerCase().includes('...')
  )

  return pesquisa ?? opcoes[Math.floor(Math.random() * opcoes.length)]
}
