/**
 * useKapivarusFala.mjs — hook que orquestra
 *   1. fala com speechSynthesis (via kapivarus-voz.mjs)
 *   2. destaque da palavra corrente no BalaoFala
 *   3. cancelamento ao mudar de mensagem, trocar de rota ou aba oculta
 *   4. botão "ouvir de novo" / pular
 *   5. uma lembrete de voz gentil quando o user estiver parado (idle), se
 *      configurado — máximo 1 por tela, nunca durante tarefa ativa
 *
 * Divergência do componente: o hook é reutilizável e chama o catálogo de
 * frases; o componente Kapivarus e BalaoFala ficam num nível acima.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  falar,
  cancelar,
  pularFala,
  ouvirPalavraAtiva,
  ouvirPularFala,
  setVozLigada,
  setVolumeAVoz,
  setModoVelocidadeVoz,
  registrarInteracao,
  forçarPrimeiraInteracao,
  observarVisibilidade,
  estimarTempoPorPalavra,
  temVoz,
  jaInteragiu,
} from './kapivarus-voz.mjs'

/**
 * catálogo de frases por evento (textos que o hook vai "falar").
 * mantidos em arquivo JSON separado para fácil edição — o arquivo
 * frasesKapivarus.json (que este hook lê via require/import
 * dependendo da estratégia de ingestão).
 *
 * para simplicidade neste patch, deixamos as frases aqui também
 * (compatible com consumo imediato) e recomenda-se migração para
 * JSON quando houver domínio do catálogo.
 */
const FRASES = {
  'boas-vindas': [
    'Oi, aventureiro(a)! Vamos começar nossa trilha?',
    'Bem-vindo de volta! Você manda muito bem!',
    'Saudades! Hoje a gente segue tranquilo?',
  ],
  'volta-apos-dias': [
    'Ufa, com você voltou! Como você estava?',
    'Que bom ter você aqui de novo!',
  ],
  'inicio-missao': [
    'Bora começar a missão? Bora!',
    'A missão tá à sua espera. Você consegue!',
  ],
  'acerto': [
    'Nossa, ficou ótimo!',
    'Você acertou! Vamos em frente?',
    'Top demais! O Kapivarus tá orgulhoso.',
  ],
  'acerto-em-sequencia': [
    'Você está em sequência! Continue!',
    'Respeito! Mais um, mais um...',
    'Potência! A gente não para aqui!',
  ],
  'erro': [
    'Quase! Vamos tentar de novo, juntos?',
    'É bom errar — aprende-se mais!',
    'Confia: eu te ajudo. Tenta de novo?',
  ],
  'dica': [
    'Tem uma dica aqui... ',
    'Uma pista: presta atenção no detalhe!',
  ],
  'missao-concluida': [
    'Missão cumprida! Que orgulho!',
    'Parabéns, aventureiro(a)!',
  ],
  'subiu-nivel': [
    'Você subiu de nível! Nível {nivel} em dia!',
    'Aumentou de nível! Bença!',
  ],
  'meta-do-dia-cumprida': [
    'Meta do dia cumprida! Incrível!',
    'Missões do dia completas!',
  ],
  'tocou-kapivarus': [
    'Cócegas!',
    'Bora estudar?',
    'Você está indo muito bem!',
  ],
  'ocioso': [
    'Se precisar de uma pausa, a gente pausa.',
    'Quando quiser, o Kapivarus tá aqui.',
  ],
  'despedida': [
    'Até a próxima, aventureiro(a)!',
    'Tudo bem! Até breve!',
  ],
}

// ---------------------------------------------------------------------------
// hook
// ---------------------------------------------------------------------------

export function useKapivarusFala({ voice = true, som = true, reduced = false } = {}) {
  const [mensagemAtiva, setMensagemAtiva] = useState(null)
  const [ativaIdx, setAtivaIdx] = useState(null)
  const [emFala, setEmFala] = useState(false)
  const [falarDesejavel, setFalarDesejavel] = useState(false) // se true, tenta falar a msg
  const [carreguei, setCarreguei] = useState(false)
  const [ptBrDisponivel, setPtBrDisponivel] = useState(null)
  const [tomEfeito, setTomEfeito] = useState('padrao')
  // já teve primeira interação? (sem isso o navegador bloqueia qualquer fala)
  const [interagiu, setInteragiu] = useState(() => jaInteragiu())

  const ultimaMensagem = useRef(null)
  const timerIdle = useRef(null)
  const idOuvintes = useRef([])
  const oAuId = useRef(0)
  const razaoTimerId = useRef(0)

  // inicial: tenta detectar se tem voz antes de usar
  useEffect(() => {
    ;(async () => {
      try {
        const t = await temVoz()
        setPtBrDisponivel(t.ptBr)
      } catch {
        setPtBrDisponivel(false)
      }
      setCarreguei(true)
    })()
  }, [])

  // cancelar fala ao mudar de rota (para não falar coisa errada na nova tela)
  useEffect(() => {
    return observarVisibilidade()
  }, [])

  // cancelar fala quando a mensagem muda
  useEffect(() => {
    cancelar()
    setEmFala(false)
    setAtivaIdx(null)
    setFalarDesejavel(false)
    // reset
    ultimaMensagem.current = mensagemAtiva
  }, [mensagemAtiva])

  // registra interação (pointer/keydown) uma única vez — depois disso fala pode ser
  // usada automaticamente
  useEffect(() => {
    const handler = () => {
      registrarInteracao()
      setInteragiu(true)
      // se já queria falar algo, agora consegue
      if (falarDesejavel && mensagemAtiva && ptBrDisponivel) {
        falarMensagem(mensagemAtiva, tomEfeito)
      }
    }
    window.addEventListener('pointerdown', handler, { once: true, passive: true })
    window.addEventListener('keydown', handler, { once: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', handler)
      window.removeEventListener('keydown', handler)
    }
  }, [ptBrDisponivel, falarDesejavel, mensagemAtiva, tomEfeito])

  // hook de destaque da palavra corrente
  useEffect(() => {
    if (!ptBrDisponivel) return
    const off = ouvirPalavraAtiva((ev) => {
      if (ev?.charIndex != null && ev?.charLength != null) {
        // envia índice a partir de 0
        const charStart = ev.charIndex
        const palavra = mensagemAtiva?.substring(0, charStart).split(/\s+/).filter(Boolean).length
        setAtivaIdx(palavra)
      }
    })
    idOuvintes.current.push(off)
    return () => { idOuvintes.current = idOuvintes.current.filter((o) => o !== off) }
  }, [ptBrDisponivel, mensagemAtiva])

  // ouvir pular
  useEffect(() => {
    const off2 = ouvirPularFala(() => {
      setAtivaIdx(null)
    })
    idOuvintes.current.push(off2)
    return () => { idOuvintes.current = idOuvintes.current.filter((o) => o !== off2) }
  }, [])

  // função interna de falar
  const falarMensagem = useCallback(
    async (msg, tipo = 'padrao') => {
      if (!ptBrDisponivel || !voice || !msg) return
      setTomEfeito(tipo)

      const resultado = await falar(msg, {
        cancelarAnterior: true,
        esperarAcabamento: false,
        modoAcelerado: false,
      })

      if (resultado?.falado) {
        setEmFala(true)
        // estima o tempo total da fala para limpar a palavra ativa depois
        const duracaoEstimada = estimarTempoPorPalavra(msg) + 400
        setTimeout(() => setAtivaIdx(null), duracaoEstimada)
      }
    },
    [ptBrDisponivel, voice]
  )

  // função para re-falar a mensagem atual (botão "ouvir de novo")
  const refalar = useCallback(() => {
    if (mensagemAtiva && ptBrDisponivel && voice) {
      falarMensagem(mensagemAtiva, tomEfeito)
    } else {
      pularFala()
    }
  }, [mensagemAtiva, ptBrDisponivel, voice, tomEfeito, falarMensagem])

  // setar mensagem nova com opcional fala automática
  const dizer = useCallback(
    (msg, tipo = 'padrao', { falarAgora = true } = {}) => {
      setMensagemAtiva(msg)
      setTomEfeito(tipo)
      if (falarAgora && voice && ptBrDisponivel) {
        setFalarDesejavel(true)
        // falar começou somente após primeira interacao
        razaoTimerId.current = window.setTimeout(() => {
          falarMensagem(msg, tipo)
        }, 80)
      }
      // cancela timer Idle
      clearTimeout(timerIdle.current)
      timerIdle.current = null
    },
    [voice, ptBrDisponivel, falarMensagem]
  )

  // pular/parar a fala (botão ⏭ do balão)
  const pular = useCallback(() => {
    pularFala()
    setAtivaIdx(null)
    setEmFala(false)
  }, [])

  // cleanup ao desmontar
  useEffect(() => {
    return () => {
      cancelar()
      idOuvintes.current.forEach((o) => o())
      clearTimeout(timerIdle.current)
    }
  }, [])

  // ------------------------------------------------------------------
  // idle gentil (somente één lembrete por tela, jamais durante atividade)
  // ------------------------------------------------------------------
  const ativarLembreteOcioso = useCallback(
    (fn) => {
      // fn: () => void — é a ação que pode ser chamada quando idle atingido
      clearTimeout(timerIdle.current)
      timerIdle.current = window.setTimeout(fn, 25000)
    },
    []
  )

  const cancelarLembreteOcioso = useCallback(() => {
    clearTimeout(timerIdle.current)
    timerIdle.current = null
  }, [])

  return {
    mensagemAtiva,
    ativaIdx,
    emFala,
    ptBrDisponivel,
    aguardandoInteracao: !interagiu,
    carreguei,
    dizer,
    refalar,
    pular,
    setVozLigada,
    setVolumeAVoz,
    setModoVelocidadeVoz,
    ativarLembreteOcioso,
    cancelarLembreteOcioso,
    falar: falarMensagem, // expor direto se algum caso externo quiser
  }
}

// ------------------------------------------------------------------
// export default para quem usar (quem for usar)
// ------------------------------------------------------------------
export default useKapivarusFala
