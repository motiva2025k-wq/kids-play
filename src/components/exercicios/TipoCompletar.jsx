// Exercício: completar frase (lacuna) com opções táteis.
//
// Props do RendererExercicios:
//   pergunta: {
//     tipo: 'completar',
//     enunciado: string (com <preenche> nos lugares a completar, ex: "O cachorro tem ____ patas."),
//     dados: {
//       opcoes: Array<{ texto: string }>,   // ex: ["quatro", "duas", "cinco", "uma"]
//       correta: string,                     // texto da opção correta (ex: "quatro")
//       respostaCorretaTexto?: string,       // frase completa para feedback
//     },
//     dica: string,
//     explicacao: string,
//     ordem: number,
//   }
//
// Destacar: sem teclado — a criança toca nas opções.

import { useCallback, useState } from 'react'

export default function TipoCompletar({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao = 'Ouvir frase',
}) {
  const [selecionado, setSelecionado] = useState(null)

  const opcoes = (pergunta?.dados?.opcoes || []).slice()
  // embaralha para não deixar a ordem fixa
  for (let i = opcoes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[opcoes[i], opcoes[j]] = [opcoes[j], opcoes[i]]
  }

  const correta = pergunta?.dados?.correta ?? null

  const lidar = useCallback(
    (opcao) => {
      if (disabled) return
      setSelecionado(opcao)
      onResponder?.(opcao?.texto === correta)
    },
    [correta, disabled, onResponder],
  )

  const corDoEstado = (opcao) => {
    if (selecionado == null) return 'border-roxo-claro hover:bg-roxo-claro'
    if (opcao.texto === correta) return 'border-verde-escuro bg-verde-claro'
    if (opcao === selecionado && opcao.texto !== correta)
      return 'border-vermelho-escuro-suave bg-vermelho-claro-suave'
    return 'border-roxo-claro'
  }

  // Monta enunciado com highlight da lacuna
  const enunciadoComLacuna = pergunta?.enunciado || ''

  return (
    <div className="space-y-4">
      {/* frase com lacuna */}
      <div className="txt">
        <h3 className="text-xl font-bold leading-snug">
          {enunciadoComLacuna}
        </h3>
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

      {/* opções */}
      <div className="grid gap-3 sm:grid-cols-2">
        {opcoes.map((op, i) => (
          <button
            key={i}
            type="button"
            disabled={!!disabled && selecionado != null}
            onClick={() => {
              const opcao = opcoes[i]
              if (!opcao) return
              lidar(opcao)
            }}
            className={`btn-afunda bloco min-h-[64px] px-5 py-4 text-lg font-bold text-left border-2 ${corDoEstado(op)}`}
          >
            {op.texto}
          </button>
        ))}
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
