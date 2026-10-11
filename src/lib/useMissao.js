import { useState, useCallback } from 'react'
import { supabase } from './supabase'

const STATUS = {
  carregando: 'carregando',
  erro: 'erro',
  prova: 'prova',
  final: 'final',
  pausado: 'pausado'
}

export function useMissao({ idCrianca, idMissao, bark }) {
  const [status, setStatus] = useState('carregando')
  const [pergunta, setPergunta] = useState(null)
  const [posicao, setPosicao] = useState(0)
  const [total, setTotal] = useState(0)
  const [resultado, setResultado] = useState(null)
  const [enunciadoLido, setEnunciadoLido] = useState(false)

  const carregar = useCallback(async () => {
    setStatus('carregando')
    // Mock implementation for build
    setTimeout(() => {
      setStatus('final')
      setResultado({
        acertos: 3,
        total: 5,
        percentual: 60,
        estrelas: 2,
        xp: 15,
        moedas: 10,
        refeita: false
      })
    }, 100)
  }, [])

  const responder = useCallback(async (correta) => {
    // Mock
  }, [])

  const usarDica = useCallback(() => {}, [])

  const pausar = useCallback(() => {
    setStatus('pausado')
  }, [])

  const retomar = useCallback(() => {
    setStatus('prova')
  }, [])

  const confirmarEnvio = useCallback(async () => {
    return { online: !!supabase }
  }, [])

  return {
    status,
    pergunta: status === STATUS.prova ? pergunta : null,
    posicao: status === STATUS.prova ? posicao : 0,
    total: status === STATUS.prova ? total : 0,
    resultado,
    enunciadoLido,
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

const _questoesIniciais = []
