// Exercício: múltipla escolha.
//
// Props esperadas pelo RendererExercicios:
//   pergunta: {
//     tipo: 'multipla_escolha',
//     enunciado: string,
//     dados: {
//       alternativas: Array<{ texto: string; correta: boolean }>  // pelo menos 2
//     },
//     dica: string,
//     explicacao: string,
//     ordem: number,
//   }
//   onResponder: (escolhaCorreta: boolean) => void   // escolhaCorreta informa se acertou
//   disabled?: boolean
//   lerEmVozAlta?: () => void
//   labelAcentuacao?: string

import { useCallback, useRef, useState } from 'react'

export default function TipoMultiplaEscolha({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao = 'Ouvir pergunta',
}) {
  const [selecionado, setSelecionado] = useState(null)
  const timerRef = useRef(null)

  const alternativas = (pergunta?.dados?.alternativas || [])
    .slice()
    .sort(() => Math.random() - 0.5) // embaralha visual para não decorar a posição

  const textoCorreta = (pergunta?.dados?.alternativas || [])
    .find((a) => a.correta)?.texto

  const lidar = useCallback(
    (opcao) => {
      if (disabled) return
      setSelecionado(opcao)
      const escolhaCorreta =
        opcao?.correta === true
      if (onResponder) onResponder(escolhaCorreta)
    },
    [onResponder, disabled],
  )

  // decidir a cor de cada botão
  const corDoEstado = (opcao) => {
    if (!selecionado) return 'border-roxo-claro hover:bg-roxo-claro'
    if (opcao.correta) return 'border-verde-escuro bg-verde-claro'
    if (opcao === selecionado && !opcao.correta) return 'border-vermelho-escuro-suave bg-vermelho-claro-suave'
    return 'border-roxo-claro'
  }

  if (!pergunta?.enunciado) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Enunciado + áudio */}
      <div className="txt">
        <h3 className="text-xl font-bold leading-snug">{pergunta.enunciado}</h3>
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

      {/* Alternativas */}
      <div className="grid gap-3 sm:grid-cols-2">
        {alternativas.map((alt, i) => (
          <button
            key={i}
            type="button"
            disabled={!!disabled && selecionado !== null}
            onClick={() => {
              const op = alternativas[i]
              if (!op) return
              lidar({ ...op, texto: op.texto })
            }}
            className={`btn-afunda bloco min-h-[64px] px-5 py-4 text-lg font-bold text-left uppercase tracking-wide border-2 ${corDoEstado(alt)}`}
            // Usa o texto como chave visual se o array for memoizado.
            // Evita o uso de índice como key quando o renderer memoiza por opção.
          >
            {alt.texto}
          </button>
        ))}
      </div>

      {/* Dica: botão de dica (não obrigatório, aparece se houver) */}
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
