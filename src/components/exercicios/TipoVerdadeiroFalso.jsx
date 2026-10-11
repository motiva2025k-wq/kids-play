// Exercício: verdadeiro ou falso.
//
// Props idênticas ao RendererExercicios.
//   pergunta: {
//     tipo: 'verdadeiro_falso',
//     enunciado: string,
//     dados: {
//       correta: boolean,          // true = "Verdadeiro", false = "Falso"
//       respostaCorretaTexto?: string  // opcional: frase da resposta para feedback
//     },
//     dica: string,
//     explicacao: string,
//     ordem: number,
//   }

import { useCallback, useState } from 'react'

export default function TipoVerdadeiroFalso({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao = 'Ouvir pergunta',
}) {
  const [selecionado, setSelecionado] = useState(null)

  const correta = pergunta?.dados?.correta ?? true

  const lidar = useCallback(
    (escolha) => {
      if (disabled) return
      setSelecionado(escolha)
      onResponder?.(escolha === correta)
    },
    [correta, disabled, onResponder],
  )

  const corDoEstado = (escolha) => {
    if (selecionado == null) return 'border-roxo-claro hover:bg-roxo-claro'
    if (escolha === correta) return 'border-verde-escuro bg-verde-claro'
    if (escolha === selecionado && escolha !== correta)
      return 'border-vermelho-escuro-suave bg-vermelho-claro-suave'
    return 'border-roxo-claro'
  }

  return (
    <div className="space-y-4">
      {/* enunciado */}
      <div className="txt">
        <h3 className="text-xl font-bold leading-snug">{pergunta?.enunciado}</h3>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={lerEmVozAlta}
            className="btn-afunda min-h-[48px] min-w-[48px] rounded-xl border-2 border-dourado-escuro bg-dourado-claro text-azul-escuro font-bold hover:bg-dourado/85 focus-visible:outline-3 focus-visible:outline-dourado"
            aria-label={labelAcentuacao}
          >
            🎧 {labelAcentuacao}
          </button>
        </div>
      </div>

      {/* botões VF */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!!disabled && selecionado != null}
          onClick={() => lidar(true)}
          className={`btn-afunda bloco min-h-[80px] px-4 py-6 text-xl font-bold uppercase text-center border-2 ${corDoEstado(true)}`}
        >
          Verdadeiro
        </button>
        <button
          type="button"
          disabled={!!disabled && selecionado != null}
          onClick={() => lidar(false)}
          className={`btn-afunda bloco min-h-[80px] px-4 py-6 text-xl font-bold uppercase text-center border-2 ${corDoEstado(false)}`}
        >
          Falso
        </button>
      </div>

      {pergunta?.dica && (
        <details className="group text-sm">
          <summary className="cursor-pointer font-semibold underline underline-offset-2 hover:text-azul-escuro focus-visible:outline-3 focus-visible:outline-dourado rounded">
            Dica
          </summary>
          <p className="mt-1 opacity-80">{pergunta.dica}</p>
        </details>
      )}
    </div>
  )
}
