// Preferências de bem-estar: "Reduzir animações" e "Silenciar sons".
// Estado persistido em localStorage e aplicado como classe no <body>,
// para valer em todas as telas. Respeita também o prefers-reduced-motion
// do sistema (independente deste botão).
import { useEffect, useState } from "react"

const CHAVE_ANIMACOES = "kp-reduzir-animacoes"
const CHAVE_SOM = "kp-silenciar-sons"

function ler(chave) {
  try {
    return localStorage.getItem(chave) === "1"
  } catch {
    return false
  }
}

export default function Preferencias({ className = "" }) {
  const [reduzirAnimacoes, setReduzirAnimacoes] = useState(() => ler(CHAVE_ANIMACOES))
  const [silenciarSons, setSilenciarSons] = useState(() => ler(CHAVE_SOM))

  useEffect(() => {
    document.body.classList.toggle("sem-animacoes", reduzirAnimacoes)
    try {
      localStorage.setItem(CHAVE_ANIMACOES, reduzirAnimacoes ? "1" : "0")
    } catch {
      /* sem localStorage: só não persiste */
    }
  }, [reduzirAnimacoes])

  useEffect(() => {
    document.body.classList.toggle("sem-som", silenciarSons)
    try {
      localStorage.setItem(CHAVE_SOM, silenciarSons ? "1" : "0")
    } catch {
      /* sem localStorage: só não persiste */
    }
  }, [silenciarSons])

  const clsBase =
    "btn-afunda bloco inline-flex min-h-[44px] items-center gap-2 px-3 py-2 text-sm font-bold"

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <button
        type="button"
        aria-pressed={reduzirAnimacoes}
        onClick={() => setReduzirAnimacoes((v) => !v)}
        className={`${clsBase} ${reduzirAnimacoes ? "bg-dourado-claro border-dourado-escuro text-dourado-escuro" : "bg-white text-roxo-escuro"}`}
      >
        <span aria-hidden="true">{reduzirAnimacoes ? "🎬" : "🎞️"}</span>
        {reduzirAnimacoes ? "Animações reduzidas" : "Reduzir animações"}
      </button>
      <button
        type="button"
        aria-pressed={silenciarSons}
        onClick={() => setSilenciarSons((v) => !v)}
        className={`${clsBase} ${silenciarSons ? "bg-dourado-claro border-dourado-escuro text-dourado-escuro" : "bg-white text-roxo-escuro"}`}
      >
        <span aria-hidden="true">{silenciarSons ? "🔇" : "🔊"}</span>
        {silenciarSons ? "Sons silenciados" : "Silenciar sons"}
      </button>
    </div>
  )
}
