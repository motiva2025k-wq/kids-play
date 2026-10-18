// Hook React que emite falas do Kapivarus nos eventos da loja e da
// lista de desejos. Leva o estado atual e um contexto opcional
// (ex.: { nome, preco, moedas, meta }) para preencher o texto.

import { useCallback, useRef, useState } from 'react'
import { dizer, dizerAoAcordar } from './falas.mjs'
import { falasLoja, falarEvento } from './falasLoja.mjs'

export function useFalasLoja() {
  const [fala, setFala] = useState({ texto: '', estado: 'neutro' })
  const [acordado, setAcordado] = useState(true)
  const timerRef = useRef(null)

  const falar = useCallback((evento, contexto = {}) => {
    clearTimeout(timerRef.current)

    if (!acordado) {
      setAcordado(true)
      setFala(dizerAoAcordar(contexto))
      return
    }

    const resposta = falarEvento(evento, contexto)
    setFala({ texto: resposta.texto, estado: resposta.estado })
  }, [acordado])

  const escutar = useCallback(
    (evento, contexto = {}) => {
      falar(evento, contexto)
    },
    [falar]
  )

  const acordar = useCallback(() => {
    setAcordado(true)
    setFala(dizerAoAcordar({}))
  }, [])

  const dormir = useCallback(() => {
    setAcordado(false)
    setFala({ texto: '', estado: 'neutro' })
  }, [])

  return { fala, falar, escutar, acordar, dormir }
}
