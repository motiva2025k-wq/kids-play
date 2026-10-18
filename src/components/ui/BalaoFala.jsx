// Balão de fala do Kapivarus — mantém a cara de "bloco" original
// (borda, sombra e rabicho à esquerda) e adiciona, sem mudar o layout:
//   • entrada "pop" elástico a cada mensagem nova
//   • máquina de escrever (~35 ms/letra) com botão "Ler tudo"
//   • destaque amarelo na palavra que está sendo falada (ativaIdx)
//   • botões "Ouvir de novo" 🎤 e "Pular fala" ⏭ (alvo mínimo 44 px)
//   • dica "Toque na tela para ouvir" antes da primeira interação
//   • aria-live="polite": o texto sempre fica visível e legível p/ leitor de tela
//
// Compatível com o uso antigo: aceita `children` OU `texto`.
// Reduz animações: respeita prefers-reduced-motion, a classe sem-animacoes
// do <body> (Preferencias.jsx) e a chave kp-reduzir-animacoes.
import { useEffect, useMemo, useState } from "react"
import preferencias from "../kapivarus/kapivarus-preferences.mjs"

// Mesmas cores de tom já usadas pelo Kapivarus (zero mudança de layout).
const TOM_CLASSES = {
  dica: "border-roxo-escuro bg-roxo-claro text-roxo-escuro",
  acerto: "border-verde-escuro bg-verde-claro text-verde-escuro",
  incentivo: "border-dourado-escuro bg-dourado-claro text-roxo-escuro",
  padrao: "border-roxo-escuro bg-roxo-claro text-roxo-escuro",
}

const VELOCIDADE_MS = 35 // ms por letra (30–45 pedidos)

// CSS do pop + rabicho animado — injetado uma única vez.
let cssAplicado = false
function injetarCss() {
  if (cssAplicado || typeof document === "undefined") return
  cssAplicado = true
  const el = document.createElement("style")
  el.setAttribute("data-kapi-balao", "1")
  el.textContent = `
@keyframes kapi-balao-pop {
  0%   { transform: scale(.8); }
  60%  { transform: scale(1.05); }
  100% { transform: scale(1); }
}
.kapi-balao-pop { animation: kapi-balao-pop .32s ease-out both; transform-origin: left center; }
@keyframes kapi-rabo-bater {
  0%   { transform: translateX(0); }
  40%  { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
.kapi-rabo-pop { animation: kapi-rabo-bater .45s ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .kapi-balao-pop, .kapi-rabo-pop { animation: none !important; }
}
body.sem-animacoes .kapi-balao-pop,
body.sem-animacoes .kapi-rabo-pop { animation: none !important; }
/* estrelinhas do efeito "estrelinhas" (cintilam ao redor do balão) */
.kapi-estrelas-cintilar span {
  position: absolute;
  animation: kapi-estrela-cintilar 1.6s ease-out infinite;
  pointer-events: none;
  user-select: none;
}
body.sem-animacoes .kapi-estrelas-cintilar span { animation: none !important; }
`
  document.head.appendChild(el)
}
injetarCss()

function semAnimacoes() {
  try {
    return preferencias.reduzirAnimacoesEfetivas()
  } catch {
    return false
  }
}

// estrelinhas do efeito "estrelinhas" (decorativas, ao redor do balão)
const ESTRELAS_EFEITO = [
  { top: "-8px", left: "14%", delay: "0s", tam: 14 },
  { top: "-6px", right: "16%", delay: ".35s", tam: 12 },
  { top: "34%", right: "-10px", delay: ".7s", tam: 13 },
  { bottom: "-8px", left: "30%", delay: "1s", tam: 12 },
  { top: "40%", left: "-10px", delay: ".5s", tam: 13 },
]

function EstrelasCintilando() {
  return (
    <span className="kapi-estrelas-cintilar" aria-hidden="true">
      {ESTRELAS_EFEITO.map((e, i) => (
        <span
          key={i}
          style={{
            top: e.top,
            left: e.left,
            right: e.right,
            bottom: e.bottom,
            animationDelay: e.delay,
            fontSize: e.tam,
            color: "#f5b301",
          }}
        >
          ✨
        </span>
      ))}
    </span>
  )
}

export default function BalaoFala({
  texto = "",
  tom = "dica",
  efeito = null,           // 'estrelinhas' | 'confete' | 'pulsar' | 'lampada' | 'suave'
  ativaIdx = null,          // índice (1-based) da palavra sendo falada
  aoOuvirDeNovo,            // função do botão 🎤
  aoParar,                  // função do botão ⏭ (pular fala)
  aguardandoInteracao = false, // mostra a dica "Toque na tela para ouvir"
  rodape = null,            // slot extra (ex.: botão "Entendi")
  className = "",
  children,
  ...props
}) {
  injetarCss()

  const conteudo = texto || (typeof children === "string" ? children : "")
  const [n, setN] = useState(0)
  const [reduzido, setReduzido] = useState(false)

  // Detecta "reduzir animações" quando a mensagem chega.
  useEffect(() => {
    setReduzido(semAnimacoes())
  }, [conteudo])

  // Máquina de escrever — texto aparece inteiro de uma vez se reduzido.
  useEffect(() => {
    if (!conteudo) return
    if (reduzido) {
      setN(conteudo.length)
      return
    }
    setN(0)
    let i = 0
    const id = setInterval(() => {
      i += 1
      setN(i)
      if (i >= conteudo.length) clearInterval(id)
    }, VELOCIDADE_MS)
    return () => clearInterval(id)
  }, [conteudo, reduzido])

  const completo = n >= conteudo.length
  const revelado = conteudo.slice(0, n)
  const palavras = useMemo(() => revelado.split(" "), [revelado])

  const classeTom = TOM_CLASSES[tom] || TOM_CLASSES.dica
  // classes de efeito do catálogo (nenhuma animação se "reduzido")
  const classeEfeito =
    reduzido || !efeito || efeito === "suave"
      ? ""
      : efeito === "pulsar"
      ? "kapi-efeito-pulsar"
      : efeito === "confete"
      ? "kapi-efeito-brilhar"
      : efeito === "lampada"
      ? "kapi-efeito-lampada"
      : ""

  // Botão primário: "Ler tudo" enquanto estiver datilografando.
  function completar() {
    setN(conteudo.length)
  }

  return (
    <div className={`bloco relative max-w-md px-4 py-3 ${classeTom} ${classeEfeito} ${className}`} {...props}>
      {/* Efeito "estrelinhas": cintilam ao redor do balão */}
      {efeito === "estrelinhas" && !reduzido && <EstrelasCintilando />}
      {/* Rabicho à esquerda (igual ao original) — dá uma "chapadinha" no pop */}
      <span
        aria-hidden="true"
        className={`absolute -left-3 top-6 block h-0 w-0 border-y-[10px] border-r-[12px] border-y-transparent border-r-current opacity-70 ${
          reduzido ? "" : "kapi-rabo-pop"
        }`}
      />

      {/* Texto com aria-live: visível sempre, anunciado sem interrupção */}
      <p
        key={conteudo} // remonta → reinicia o pop a cada mensagem nova
        aria-live="polite"
        aria-atomic="true"
        className={`text-lg font-semibold leading-snug ${reduzido ? "" : "kapi-balao-pop"}`}
      >
        {palavras.map((palavra, idx) => {
          const ativa = ativaIdx != null && ativaIdx === idx + 1
          return (
            <span key={idx}>
              {idx > 0 ? " " : ""}
              <span
                className={
                  ativa
                    ? "rounded bg-[#FFC21A] px-0.5 text-roxo-escuro shadow-[inset_0_-2px_0_rgba(0,0,0,.15)]"
                    : undefined
                }
              >
                {palavra}
              </span>
            </span>
          )
        })}
        {!completo && !reduzido && (
          <span aria-hidden="true" className="ml-0.5 inline-block w-[0.6ch] animate-pulse bg-current align-baseline" style={{ height: "1em", verticalAlign: "-0.15em" }}>
            ▍
          </span>
        )}
        {/* Texto completo para leitores de tela (enquanto datilografa) */}
        {!completo && <span className="sr-only">{conteudo}</span>}
      </p>

      {/* Dica de autoplay antes da primeira interação */}
      {aguardandoInteracao && (
        <p className="mt-2 text-xs font-semibold opacity-80" role="note">
          <span aria-hidden="true">🔊</span> Toque na tela para ouvir
        </p>
      )}

      {/* Controles: sempre visíveis, alvo mínimo de 44 px */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!completo && !reduzido && (
          <button
            type="button"
            onClick={completar}
            aria-label="Mostrar a mensagem inteira"
            className="btn-afunda bloco inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 bg-white px-3 py-2 text-sm font-bold text-roxo-escuro hover:bg-roxo-claro"
          >
            <span aria-hidden="true">📖</span> Ler tudo
          </button>
        )}
        {aoOuvirDeNovo && (
          <button
            type="button"
            onClick={aoOuvirDeNovo}
            aria-label="Ouvir de novo"
            className="btn-afunda bloco inline-flex min-h-[44px] min-w-[44px] items-center justify-center bg-white px-3 py-2 text-base font-bold text-roxo-escuro hover:bg-roxo-claro"
          >
            <span aria-hidden="true">🔊</span>
          </button>
        )}
        {aoParar && (
          <button
            type="button"
            onClick={aoParar}
            aria-label="Pular a fala"
            className="btn-afunda bloco inline-flex min-h-[44px] min-w-[44px] items-center justify-center bg-white px-3 py-2 text-base font-bold text-roxo-escuro hover:bg-roxo-claro"
          >
            <span aria-hidden="true">⏭</span>
          </button>
        )}
        {rodape}
      </div>
    </div>
  )
}
