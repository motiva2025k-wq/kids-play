// Kapivarus — mascote do Kids_Play (capivara com coroa, óculos e capa de rei).
//
// Usa as imagens oficiais em /assets/kapivarus/ (webp, fundo transparente).
// Cadeia de fallback: imagem do estado → imagem "neutro" → SVG pixel original.
//
// Uso:
//   <Kapivarus estado="feliz" mensagem="Oi! Vamos começar?" tamanho="m" />
//
//   estado: neutro | feliz | comemorando | pensando | incentivando |
//           explicando | lendo | trono | dormindo   (padrão: "neutro")
//   mensagem: se presente, mostra o balão de fala ao lado
//   tom: "dica" | "acerto" | "incentivo"  (cor do balão)
//   tamanho: "p" (48 — ícone de menu) | "m" (120 — tela inicial) |
//            "g" (200 — comemoração) | número em px
//   compat (telas antigas): pose (alias de estado), size (px)
//
// Eventos do app → estado: use estadoDoEvento("acerto") etc.

import { useState } from "react"
import KapivarusSVG from "./KapivarusSVG.jsx"

export const ESTADOS_KAPIVARUS = [
  "neutro",
  "feliz",
  "comemorando",
  "pensando",
  "incentivando",
  "explicando",
  "lendo",
  "trono",
  "dormindo",
]

// Mapeamento de eventos do app para o estado do mascote.
const EVENTOS_PARA_ESTADO = {
  acerto: "feliz",
  missao_concluida: "comemorando",
  subiu_nivel: "comemorando",
  erro: "incentivando",
  dica: "explicando",
  leitura: "lendo",
  ranking: "trono",
  ausencia: "dormindo",
  carregando: "pensando",
}

/** Devolve o estado do Kapivarus para um evento do app.
 *  Ex.: estadoDoEvento("acerto") → "feliz". Desconhecido → "neutro". */
export function estadoDoEvento(evento = "") {
  return EVENTOS_PARA_ESTADO[evento] || "neutro"
}

// Tamanhos prontos (px): P = ícone de menu, M = tela inicial, G = comemoração.
const TAMANHOS = { p: 48, m: 120, g: 200 }

function imagemDe(estado) {
  return `/assets/kapivarus/kapi-${estado}.webp`
}

function resolverTamanho(tamanho) {
  if (typeof tamanho === "number" && tamanho > 0) return tamanho
  if (typeof tamanho === "string" && TAMANHOS[tamanho]) return TAMANHOS[tamanho]
  return 96 // mesmo padrão das telas antigas
}

const TOM_CLASSES = {
  dica: "border-roxo-escuro bg-roxo-claro text-roxo-escuro",
  acerto: "border-verde-escuro bg-verde-claro text-verde-escuro",
  incentivo: "border-dourado-escuro bg-dourado-claro text-roxo-escuro",
}

export default function Kapivarus({
  estado,
  pose,
  mensagem,
  tom = "dica",
  tamanho,
  size,
  className = "",
  ariaLabel,
  mostrarBotaoEntendi = false,
  onEntendi,
}) {
  const escolhido = estado || pose || "neutro"
  const estadoVal = ESTADOS_KAPIVARUS.includes(escolhido) ? escolhido : "neutro"

  // 0 = imagem do estado, 1 = imagem "neutro", 2 = SVG (último recurso)
  const [nivelFallback, setNivelFallback] = useState(0)
  const [estadoAnterior, setEstadoAnterior] = useState(estadoVal)

  // Ao trocar de estado, reinicia o fallback (e remonta a <img>,
  // disparando de novo a animação de troca de pose).
  if (estadoAnterior !== estadoVal) {
    setEstadoAnterior(estadoVal)
    setNivelFallback(0)
  }

  const px = resolverTamanho(tamanho ?? size)
  const label = ariaLabel || `Kapivarus — ${estadoVal}`

  function aoFalharImagem() {
    if (nivelFallback === 0 && estadoVal !== "neutro") {
      setNivelFallback(1) // tenta a pose neutra
    } else {
      setNivelFallback(2) // sem imagem: usa o SVG
    }
  }

  let personagem
  if (nivelFallback >= 2) {
    personagem = <KapivarusSVG pose={estadoVal} size={px} ariaLabel={label} />
  } else {
    const src = imagemDe(nivelFallback === 1 ? "neutro" : estadoVal)
    personagem = (
      // key = estado: remonta a imagem a cada troca e dispara a animação
      <span key={estadoVal} className="kapi-troca inline-flex" style={{ width: px, height: px }}>
        <img
          src={src}
          alt={label}
          width={px}
          height={px}
          loading="lazy"
          decoding="async"
          onError={aoFalharImagem}
          className="h-full w-full object-contain"
        />
      </span>
    )
  }

  // Sem mensagem: só o personagem (compatível com as telas antigas).
  if (!mensagem) {
    return <span className={`inline-block ${className}`}>{personagem}</span>
  }

  // Com mensagem: personagem + balão de fala ao lado.
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {personagem}
      <div className={`bloco relative max-w-md px-4 py-3 ${TOM_CLASSES[tom] || TOM_CLASSES.dica}`}>
        {/* "Rabicho" do balão */}
        <span className="absolute -left-3 top-6 block h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-current opacity-70" />
        <p className="text-lg font-semibold leading-snug">{mensagem}</p>
        {mostrarBotaoEntendi && (
          <button
            type="button"
            onClick={onEntendi}
            className="btn-afunda bloco mt-3 px-4 py-2 text-base font-bold hover:bg-white"
          >
            Entendi
          </button>
        )}
      </div>
    </div>
  )
}

export { KapivarusSVG }

// Lista de poses com nome e momento de uso (usada pela Galeria/Guia Visual).
export const POSES_KAPIVARUS = ESTADOS_KAPIVARUS.map((p) => ({
  id: p,
  nome: mapearNomePose(p),
  momento: getMomento(p),
}))

function mapearNomePose(p) {
  switch (p) {
    case "trono": return "no trono"
    default: return p
  }
}

function getMomento(p) {
  switch (p) {
    case "neutro": return "Boas-vindas e esperas"
    case "feliz": return "Começo da missão"
    case "comemorando": return "Acerto (comemoração)"
    case "pensando": return "Dica / raciocínio"
    case "incentivando": return "Erro gentil — incentivo"
    case "explicando": return "Explicação pós-resposta"
    case "lendo": return "Reforço / leitura"
    case "dormindo": return "Descanso / tempo esgotado"
    case "trono": return "Ranking — 1º lugar"
    default: return "Uso geral"
  }
}
