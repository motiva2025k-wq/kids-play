// Prévia antes de comprar: aplica o item no perfil e no balão do
// Kapivarus, sem gravar. Permite que a criança veja o visual antes de
// confirmar a compra, para itens de avatar, moldura, balão, fundo e
// cenário.

import { useKidsPlay } from '../store/estado.js'

const SLOTS = [
  { categoria: 'avatares', slot: 'avatar', icone: '🧸' },
  { categoria: 'molduras', slot: 'moldura_fundo', icone: '🖼️' },
  { categoria: 'baloes', slot: 'balao', icone: '🫧' },
  { categoria: 'telas', slot: 'cenario', icone: '🖥️' },
  { categoria: 'títulos', slot: 'titulo', icone: '👑' },
]

export function PreviewAplicado({ itensPorCategoria, estado }) {
  if (!itensPorCategoria) return null
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bloco p-4 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
          <p className="text-xs font-bold text-roxo-escuro/70">Perfil</p>
          <div className="mt-2 flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-roxo-claro">
              {SLOTS.map(({ categoria, slot, icone }) => {
                const id = estado.equipados?.[slot] ?? null
                const item = id ? itensPorCategoria[categoria]?.find((i) => i.id === id) : null
                return (
                  <div key={slot} className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{item ? '🎭' : icone}</span>
                    <span className="text-xs font-bold text-roxo-escuro">{item ? item.nome : 'sem item'}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="bloco p-4 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
          <p className="text-xs font-bold text-roxo-escuro/70">Balão do Kapivarus</p>
          <div className="mt-2 flex justify-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#FF8A1F]">
              <span className="text-5xl">{estado.equipados?.balao ? '🫧' : '🪐'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
