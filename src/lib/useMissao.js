// useMissao — hook que orquestra o fluxo real de uma missão.
//
// Agora usa o motor puro (motorMissao.mjs) para a lógica de progressão e
// resultado, e o repositório (repo/index.js) para ler e gravar. O repositório
// escolhe sozinho entre Supabase e localStorage, então esta tela funciona
// igual online e no modo local.
//
// API pública (inalterada em relação ao que o MissaoNova consome):
//   status, pergunta, posicao, total, resultado, enunciadoLido,
//   carregar, responder, usarDica, pausar, retomar, recarregar,
//   confirmarEnvio, setPergunta
//
// O parâmetro `bark` (opcional) recebe os eventos do catálogo de falas:
//   bark.evento(evento)  — ex.: 'inicio_missao', 'acerto', 'erro', 'dica', …
// O MissaoNova pode preferir ler o retorno de `responder` diretamente.

import { useCallback, useRef, useState } from 'react'
import { repo } from './repo/index.js'
import {
  criarMotor,
  perguntaAtual,
  totalPerguntas,
  posicaoAtual,
  responder as motorResponder,
  usarDica as motorUsarDica,
  calcularResultado,
} from './motorMissao.mjs'

const STATUS = {
  carregando: 'carregando',
  erro: 'erro',
  prova: 'prova',
  final: 'final',
  pausado: 'pausado',
}

export function useMissao({ idCrianca, idMissao, bark } = {}) {
  const [status, setStatus] = useState(STATUS.carregando)
  const [posicao, setPosicao] = useState(0)
  const [total, setTotal] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [enunciadoLido, setEnunciadoLido] = useState(false)

  // estado do motor fica em ref (não precisa re-renderizar a cada clique)
  const motorRef = useRef(null)
  const tentativaIdRef = useRef(null)
  const idCriancaRef = useRef(idCrianca)
  const idMissaoRef = useRef(idMissao)
  idCriancaRef.current = idCrianca
  idMissaoRef.current = idMissao

  // avisa o catálogo de falas (se o consumidor passou bark.evento)
  const avisar = useCallback(
    (evento) => {
      if (evento && bark?.evento) {
        try {
          bark.evento(evento)
        } catch {
          /* o balão nunca deve quebrar a missão */
        }
      }
    },
    [bark],
  )

  // ------- carregar missão + perguntas -------
  const carregar = useCallback(async () => {
    setStatus(STATUS.carregando)
    setResultado(null)
    tentativaIdRef.current = null

    const detalhe = await repo.carregarMissaoComPerguntas(idMissaoRef.current)
    const perguntas = detalhe?.perguntas ?? []

    if (!detalhe || perguntas.length === 0) {
      setStatus(STATUS.erro)
      return
    }

    // se a criança já concluiu antes, esta missão é "refeita" (XP pela metade)
    let refeita = false
    if (idCriancaRef.current) {
      const anterior = await repo.ultimaTentativa(idCriancaRef.current, idMissaoRef.current)
      refeita = Boolean(anterior?.concluida_em)
    }

    motorRef.current = criarMotor(perguntas, { refeita })
    setTotal(totalPerguntas(motorRef.current))
    setPosicao(posicaoAtual(motorRef.current))
    setStatus(STATUS.prova)
    avisar('inicio_missao')

    // cria a tentativa no banco (assíncrono; não bloqueia o início)
    if (idCriancaRef.current) {
      criarTentativa({
        crianca_id: idCriancaRef.current,
        missao_id: idMissaoRef.current,
        total: perguntas.length,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function criarTentativa(campos) {
    try {
      tentativaIdRef.current = await repo.iniciarTentativa(campos)
    } catch (e) {
      console.warn('[useMissao] não deu pra criar tentativa:', e?.message)
    }
  }

  // ------- responder (acerto/erro de verdade) -------
  const responder = useCallback(
    async (correta) => {
      const motor = motorRef.current
      if (!motor) return { evento: null }

      const r = motorResponder(motor, correta === true)

      // grava a resposta desta pergunta no banco (best-effort)
      const ultima = motor.respostas[motor.respostas.length - 1]
      if (tentativaIdRef.current && ultima) {
        repo
          .enviarRespostas([
            {
              tentativa_id: tentativaIdRef.current,
              pergunta_id: ultima.pergunta_id,
              correta: ultima.correta,
              dica_usada: ultima.dica_usada,
            },
          ])
          .catch(() => {})
      }

      // dispara o evento de fala correspondente
      avisar(r.evento)

      if (r.finalizado) {
        const res = calcularResultado(motor)
        setResultado(res)
        setStatus(STATUS.final)
        concluirTentativa(res)
      } else {
        setPosicao(posicaoAtual(motor))
        setEnunciadoLido(false)
      }

      return { evento: r.evento, acertou: r.acertou, finalizado: r.finalizado }
    },
    [avisar],
  )

  async function concluirTentativa(res) {
    if (!tentativaIdRef.current) return
    try {
      await repo.concluirTentativa(tentativaIdRef.current, res)
    } catch (e) {
      console.warn('[useMissao] não deu pra concluir tentativa:', e?.message)
    }
  }

  // ------- dica (mostra explicação pós-erro também) -------
  const usarDica = useCallback(() => {
    const motor = motorRef.current
    if (!motor) return
    motorUsarDica(motor)
    avisar('dica')
  }, [avisar])

  // ------- pausa / retomar -------
  const pausar = useCallback(() => setStatus(STATUS.pausado), [])
  const retomar = useCallback(() => {
    setStatus(motorRef.current && !motorRef.current.finalizado ? STATUS.prova : STATUS.final)
  }, [])

  // ------- envio (mantém contrato antigo: retorna { online }) -------
  const confirmarEnvio = useCallback(async () => ({ online: Boolean(repo.cliente) }), [])

  // setPergunta mantido por compatibilidade (o motor cuida do fluxo)
  const setPergunta = useCallback(() => {}, [])

  // pergunta atual vem do motor
  const pergunta =
    status === STATUS.prova ? perguntaAtual(motorRef.current) : null

  return {
    status,
    pergunta,
    posicao: status === STATUS.prova ? posicao : 0,
    total: status === STATUS.prova ? total : 0,
    resultado,
    enunciadoLido,
    setEnunciadoLido,
    carregar,
    responder,
    usarDica,
    pausar,
    retomar,
    recarregar: carregar,
    confirmarEnvio,
    setPergunta,
  }
}

export function useSaldoParaMissao(idCrianca) {
  return { idCrianca }
}
