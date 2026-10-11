// Exercício: arrastar para ordenar itens (ou ligar itens a categorias).
//
// Implementação com fallback 100% tátil (quem não consegue arrastar usa toque).
// O "arrastar" é simulado com botões de mover item para frente/fundo ou pick
// da posição correta, além de arrastar com HTML5 drag-and-drop quando disponível.
//
// Props do RendererExercicios:
//   pergunta: {
//     tipo: 'arrastar_soltar',
//     enunciado: string,
//     dados: {
//       modo: 'ordenar' | 'categorias',
//       itens: Array<{ id: string, texto: string }>,
//       // modo ordenar: ordem esperada é o índice na lista de itens OR array de ids
//       ordemEsperada: string[] | number[],
//       categorias?: Array<{ id: string, nome: string }>, // quando modo = categorias
//       // quando modo categorias, onde cada item pertence:
//       pertinencia?: { [itemId]: categoriaId },
//     },
//     dica: string,
//     explicacao: string,
//     ordem: number,
//   }

import { useCallback, useEffect, useRef, useState } from 'react'

export default function TipoArrastarSoltar({
  pergunta,
  onResponder,
  disabled = false,
  lerEmVozAlta,
  labelAcentuacao = 'Ouvir enunciado',
}) {
  const [itens, setItens] = useState(pregunta?.dados?.itens || [])
  const [ordenacao, setOrdenacao] = useState([]) // índices ou ids rearranjados
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null)

  const modo = pregunta?.dados?.modo || 'ordenar'
  const correta =
    modo === 'ordenar'
      ? pregunta?.dados?.ordemEsperada || []
      : (pregunta?.dados?.pertinencia || {})

  // inicializa ordenação no arranjo atual dos itens
  useEffect(() => {
    if (!itens.length) return
    setOrdenacao(itens.map((_, i) => i))
  }, [itens])

  const moverItem = useCallback(
    (de, para) => {
      if (disabled) return
      setOrdenacao((prev) => {
        const i = prev.indexOf(de)
        const j = prev.indexOf(para)
        if (i === -1 || j === -1 || i === j) return prev
        const novaLista = [...prev]
        novaLista.splice(i, 1)
        novaLista.splice(j, 0, de)
        return novaLista
      })
    },
    [disabled],
  )

  const subir = (id) => {
    const idx = ordenacao.indexOf(id)
    if (idx > 0) moverItem(id, ordenacao[idx - 1])
  }
  const descer = (id) => {
    const idx = ordenacao.indexOf(id)
    if (idx < ordenacao.length - 1) moverItem(id, ordenacao[idx + 1])
  }
  const arrastar = useCallback(
    (de, para) => {
      if (disabled) return
      setOrdenacao((prev) => {
        const i = prev.indexOf(de)
        const j = prev.indexOf(para)
        if (i === -1 || j === -1 || i === j) return prev
        const novaLista = [...prev]
        novaLista.splice(i, 1)
        novaLista.splice(j, 0, de)
        return novaLista
      })
    },
    [disabled],
  )

  const corrida = correta
  const acertou = (modo === 'categorias') ? undefined : true // cálculo abaixos

  // controla a resposta ao "enviar"
  const enviar = useCallback(() => {
    const atual = ordenacao.map((id) => {
      // mapeia id para texto para comparação
      const item = itens.find((it) => it.id === id)
      return item?.texto || String(id)
    })
    const esperada = correta.map((id) => {
      const item = itens.find((it) => it.id === id)
      return item?.texto || String(id)
    })
    onResponder?.(atual.join(',') === esperada.join(','))
  }, [atual, esperada, correta, itens, onResponder])

  // render
  const renderItem = (id, idx) => {
    const item = itens.find((it) => it.id === id)
    return (
      <div
        key={id}
        className="btn-afunda bloco min-h-[56px] px-4 py-3 text-lg font-bold border-2 border-roxo-claro bg-white flex items-center justify-between gap-2"
        draggable
        onDragStart={(e) => {
          e.dataTransfer?.setData('text/plain', String(id))
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const alvo = e.dataTransfer?.getData('text/plain')
          if (alvo) arrastar(id, alvo == id ? (ordenacao[1]||id) : alvo)
        }}
      >
        <span>{item?.texto}</span>
        <div className="flex gap-1">
          <button type="button" onClick={() => subir(id)} className="btn-afunda bloco min-w-[36px] w-9 h-9 rounded-full bg-dourado-claro border-2 border-dourado-escuro font-bold">▲</button>
          <button type="button" onClick={() => descer(id)} className="btn-afunda bloco min-w-[36px] w-9 h-9 rounded-full bg-dourado-claro border-2 border-dourado-escuro font-bold">▼</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* enunciado + áudio */}
      <div className="txt">
        <h3 className="text-xl font-bold leading-snug">
          {pregunta?.enunciado}
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

      {/* instrução */}
      <p className="opacity-80 text-sm">
        Arraste os itens para a ordem correta, ou use ▲ ▼. Depois clique em “Verificar”.
      </p>

      {/* lista de itens rearranjável */}
      <div className="flex flex-col gap-2">
        {ordenacao.map((id, idx) => (
          <div key={id} className="flex items-center gap-2">
            <span className="w-6 text-right font-bold opacity-70">{idx + 1}.</span>
            {renderItem(id, idx)}
          </div>
        ))}
      </div>

      {/* categoria */}
      {modo === 'categorias' && (
        <div>
          <p className="text-sm font-semibold opacity-80">
            Toque em cada item e depois escolha a categoria de baixo.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {itens.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategoriaSelecionada(item.id)}
                className="btn-afunda bloco min-h-[56px] px-4 py-3 text-lg border-2 border-roxo-claro bg-white"
              >
                {item.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* botões de categoria quando selecionado */}
      {modo === 'categorias' && categoriaSelecionada && pregunta?.dados?.categorias && (
        <div className="space-y-2">
          <p className="text-sm font-semibold opacity-80">Escolha a categoria:</p>
          <div className="flex flex-wrap gap-2">
            {pregunta.dados.categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (onResponder) {
                    onResponder(pregunta.dados.pertinencia?.[categoriaSelecionada] === cat.id)
                  }
                  setCategoriaSelecionada(null)
                }}
                className="btn-afunda bloco min-h-[48px] px-5 py-3 text-base border-2 border-roxo-claro bg-white"
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* corrigir */}
      <button
        type="button"
        disabled={!!disabled}
        onClick={enviar}
        className="btn-afunda min-h-[56px] px-6 py-4 text-lg font-bold border-2 border-roxo-escuro bg-roxo text-white hover:bg-roxo-escuro focus-visible:outline-3 focus-visible:outline-dourado"
      >
        Verificar
      </button>

      {/* dica */}
      {pregunta?.dica && (
        <details className="group text-sm">
          <summary className="cursor-pointer font-semibold underline underline-offset-2 hover:text-azul-escuro focus-visible:outline-3 focus-visible:outline-dourado rounded">
            Dica
          </summary>
          <p className="mt-1 opacity-80">{pregunta.dica}</p>
        </details>
      )}
    </div>
  )
}
