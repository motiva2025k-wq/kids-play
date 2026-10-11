// Exercício: contar imagens em pixel art e escolher o número.
//
// Props (RendererExercicios):
//   pergunta: {
//     tipo: 'contar_imagens',
//     enunciado: string (ex: "Quantos animais você vê?"),
//     dados: {
//       visual: {
//         base64PNG?: string,   // opcional: imagem pronta via data URL
//         svg?: string,         // opcional: SVG em string (inline) com os objetos
//         svgId?: string,       // id do svg inline no banco de imagens
//         pixelGrid?: number[] // grades 1D de pixels em tons, usados pelo render auxiliar
//       },
//       opcoes: Array<number>,   // ex: [3, 4, 5, 6]
//       correta: number,         // ex: 5
//       respostaCorretaTexto?: string,
//       max_mostra?: number,     // quantos objetos mostrar no grid (ex: 6)
//     },
//     dica: string,
//     explicacao: string,
//     ordem: number,
//   }
//
// Destacar: opções em botões grandes e numéricas. Sem teclado.

import { useCallback, useState } from 'react'

export default function TipoContarImagens({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao = 'Ouvir pergunta',
}) {
  const [selecionado, setSelecionado] = useState(null)
  const correta = pergunta?.dados?.correta ?? 0

  const lidar = useCallback(
    (numero) => {
      if (disabled) return
      setSelecionado(numero)
      onResponder?.(numero === correta)
    },
    [correta, disabled, onResponder],
  )

  const opcoes = (pergunta?.dados?.opcoes || [])
    .slice()
    .sort(() => Math.random() - 0.5)

  const corDoEstado = (n) => {
    if (selecionado == null) return 'border-roxo-claro hover:bg-roxo-claro'
    if (n === correta) return 'border-verde-escuro bg-verde-claro'
    if (n === selecionado && n !== correta)
      return 'border-vermelho-escuro-suave bg-vermelho-claro-suave'
    return 'border-roxo-claro'
  }

  const mostraObjetos =
    pergunta?.dados?.max_mostra ??
    Math.min(correta + 2, 6)

  // Render da imagem de contagem: um grid de SVG simples que marca a quantidade
  const imagemContagem = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* Use this placeholder if no SVG in dados; quem implementa pode injetar seu próprio SVG */}
      <rect x="2" y="2" width="20" height="20" rx="2" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )

  return (
    <div className="space-y-4">
      {/* enunciado + áudio */}
      <div className="txt">
        <h3 className="text-xl font-bold leading-snug">
          {pergunta?.enunciado}
        </h3>
        <div className="mt-3 flex justify-center">
          {/* Pixel art aqui */}
          {imagemContagem}
        </div>
        <div className="mt-2 flex gap-2 justify-center">
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

      {/* número a contar (opcional): mostra um número grande para a criança */}
      <div className="txt text-center text-xl font-bold opacity-60" aria-hidden="true">
        Conta os objetos e depois escolhe o número.
      </div>

      {/* botões numéricos */}
      <div className="flex flex-wrap justify-center gap-3">
        {opcoes.map((n) => (
          <button
            key={n}
            type="button"
            disabled={!!disabled && selecionado != null}
            onClick={() => lidar(n)}
            className={`btn-afunda bloco min-h-[80px] min-w-[80px] rounded-2xl text-2xl font-bold border-4 ${corDoEstado(n)}`}
          >
            {n}
          </button>
        ))}
      </div>

      {/* dica */}
      {pregunta?.dica && (
        <details className="group text-sm">
          <summary className="cursor-pointer font-semibold underline underline-offset-2 hover:text-azul-escuro focus-visible:outline-3 focus-visible:outline-dourado rounded">
            Dica
          </summary>
          <div className="mt-1 opacity-80">{pregunta.dica}</div>
        </details>
      )}
    </div>
  )
}
