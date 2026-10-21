// Faixa que avisa quando o service worker guardou uma versão nova do app.
//
// Fica acima do menu inferior para não cobrir o cabeçalho nem o conteúdo, e é
// dispensável: atualizar recarrega a página, e no meio de uma missão a criança
// voltaria para a primeira pergunta. Por isso o aviso, em vez de trocar sozinho.
import { useEffect, useState } from 'react'
import { aplicarAtualizacao, assinarAtualizacao } from '../lib/pwa.js'

export default function AvisoAtualizacao() {
  const [disponivel, setDisponivel] = useState(false)
  const [dispensado, setDispensado] = useState(false)

  useEffect(() => assinarAtualizacao(() => setDisponivel(true)), [])

  if (!disponivel || dispensado) return null

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="aviso-atualizacao"
      className="fixed inset-x-0 bottom-20 z-50 mx-auto w-full max-w-3xl px-4"
    >
      <div className="bloco flex flex-wrap items-center justify-between gap-3 bg-white p-4 shadow-[0_6px_0_0_var(--color-roxo-claro)]">
        <div className="min-w-0">
          <p className="font-bold text-roxo">Versão nova do Kids_Play</p>
          <p className="text-sm opacity-80">
            Se estiver numa missão, ela recomeça do começo.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setDispensado(true)}
            className="btn-afunda min-h-[44px] rounded-xl border-2 border-roxo-claro bg-white px-4 font-bold text-roxo-escuro"
          >
            Depois
          </button>
          <button
            type="button"
            onClick={aplicarAtualizacao}
            className="btn-afunda min-h-[44px] rounded-xl border-2 border-roxo-escuro bg-roxo px-4 font-bold text-white"
          >
            Atualizar agora
          </button>
        </div>
      </div>
    </div>
  )
}
