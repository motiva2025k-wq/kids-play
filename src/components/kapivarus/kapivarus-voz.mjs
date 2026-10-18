/**
 * kapivarus-voz.mjs — camada de voz do Kapivarus.
 *
 * Responsabilidade única: ocupar-se da síntese de voz (SpeechSynthesis) com
 * melhor voz pt-BR disponível, sem bloquear o app quando não houver voz, e
 * fornecer funções para falar, parar, pular e escolher se o auto-play está
 * habilitado após a primeira interação.
 *
 * Nota técnica: a API é assíncrona no carregamento (voiceschanged). Por isso
 * a função `resolverVozes()` é reutilizável e a `falar()` espera por ela se
 * necessário, com timeout de sincronia.
 */

const LOG_TAG = '[Kapivarus-voz]'

// opções padrão de narração infantil (calma)
const PADRAO = {
  lang: 'pt-BR',
  pitch: 1.18,
  rate: 0.9,
  volume: 0.85,
}

// ---------------------------------------------------------------------------
// detecção de primeira interação (autoplay block)
// ---------------------------------------------------------------------------
let primeiraInteracao = false
const ouvintes = new Set()

function marcarPrimeiraInteracao() {
  if (primeiraInteracao) return
  primeiraInteracao = true
  ouvintes.forEach((cb) => cb())
  ouvintes.clear()
}

// espera por uma "primeira interação jogável" (mouse/touch/voice/listener de fala)
function aguardarPrimeiraInteracao() {
  return new Promise((resolve) => {
    if (primeiraInteracao) { resolve(true); return }
    const cb = () => { resolve(true) }
    ouvintes.add(cb)
    window.addEventListener('pointerdown', cb, { once: true, passive: true })
    window.addEventListener('keydown', cb, { once: true, passive: true })
    window.addEventListener('touchstart', cb, { once: true, passive: true })
    window.addEventListener('SpeechSynthesisUtterance', cb, { once: true, passive: true }) // não existe
  })
}

// ---------------------------------------------------------------------------
// escolher melhor voz pt-BR
// ---------------------------------------------------------------------------
const CARACTERISTICAS_PT_BR = [
  { prefere: 'Google', texto: 'Google pt-BR' },
  { prefere: 'Microsoft', texto: 'Microsoft pt-BR' },
  { prefere: 'Natural', texto: 'Natural Reader' },
  { prefere: 'female', texto: 'voz feminina (silhuetta)' },
]

function escolherVoz(vozes) {
  // tenta ordenação inteligente, com as seguencias acima. se nada, retorna primeira pt-BR
  const filtradas = vozes.filter((v) => /pt-BR/i.test(v.lang ?? ''))
  if (!filtradas.length) return null

  const comNome = (predicados) => filtradas.find((v) => {
    const nome = v.name ?? ''
    return predicados.some((p) => nome.toLowerCase().includes(p.toLowerCase()))
  })

  for (const ku of CARACTERISTICAS_PT_BR) {
    const encontrada = comNome([ku.prefere, ku.texto])
    if (encontrada) return encontrada
  }

  // fallback por gênero suave (se disponível)
  const feminina = filtradas.find((v) => /(female|mulher|feminina)/i.test(v.name ?? ''))
  if (feminina) return feminina
  const masculina = filtradas.find((v) => /(male|homem|masculino)/i.test(v.name ?? ''))
  if (masculina) return masculina

  // fallback geral
  return filtradas[0]
}

// ---------------------------------------------------------------------------
// espera pelo carregamento das vozes (com atraso máximo)
// ---------------------------------------------------------------------------
function esperarVozes(timeoutMs = 3000) {
  return new Promise((resolve) => {
    let ja = window?.speechSynthesis?.getVoices()
    if (ja && ja.length) { resolve(ja); return }

    const t = setTimeout(() => { resolve(window?.speechSynthesis?.getVoices() ?? []) }, timeoutMs)

    const handleVoices = () => {
      clearTimeout(t)
      const v = window?.speechSynthesis?.getVoices()
      if (v && v.length) resolve(v)
    }
    if (window?.speechSynthesis) {
      window.speechSynthesis.addEventListener?.('voiceschanged', handleVoices, { once: true })
      // fall-back: tenta de novo após 200ms
      setTimeout(() => {
        const v2 = window?.speechSynthesis?.getVoices()
        if (v2 && v2.length) {
          clearTimeout(t)
          handleVoices()
        }
      }, 200)
    } else {
      clearTimeout(t)
      resolve([])
    }
  })
}

// ---------------------------------------------------------------------------
// API principal
// ---------------------------------------------------------------------------
let vozCache = null       // voz escolhida (opcional)
let opcoesAtivas = { ...PADRAO }
let vozAtiva = null       // utterance em andamento
let cancelado = false

/**
 * configurar opções e voz. por padrão: pt-BR, pitch 1.18, rate 0.9.
 */
var windowRef = typeof globalThis !== 'undefined' ? globalThis : undefined
export function configurarVoz(opts = {}) {
  if (opts.pitch != null) opcoesAtivas.pitch = opts.pitch
  if (opts.rate != null) opcoesAtivas.rate = opts.rate
  if (opts.volume != null) opcoesAtivas.volume = opts.volume
  if (opts.lang != null) opcoesAtivas.lang = opts.lang
  // se passou voz explícita, cacheia
  if (opts.voice) { vozCache = opts.voice }
}

/**
 * retorna true se há voz pt-BR pronta (ou pronta depois de carregada)
 */
export async function temVoz() {
  if (typeof window === 'undefined' || !window?.speechSynthesis) return { suportado: false, ptBr: false }
  const v = await esperarVozes()
  const pt = v.find((z) => /pt-BR/i.test(z.lang ?? ''))
  return { suportado: true, ptBr: !!pt }
}

/**
 * falar o texto. se voz estiver desetinada (after first-interaction + muted)
 * o texto nunca é falado mas retorna ok
 *
 * retorna: { falado: bool, cancelado: bool, erro?: string }
 */
export async function falar(texto, { cancelarAnterior = true, esperarAcabamento = false, modoAcelerado = false } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return { falado: false, cancelado: false, erro: 'speechSynthesis indisponível' }
  }

  if (cancelarAnterior) cancelar()

  // se ainda não houve primeira interação, não fala
  if (!primeiraInteracao) return { falado: false, cancelado: false, erro: 'aguardando primeira interação' }

  const velocidadeEsperada = opcoesAtivas.rate
  const vozEscolhida = vozCache ?? (await buscarVozAtiva())
  if (!vozEscolhida) {
    // sem voz pt-BR: somente texto no balão, sem falha
    return { falado: false, cancelado: false, erro: 'sem voz pt-BR' }
  }
  if (!(opcoesAtivas.volume > 0)) {
    // mudo: só texto, sem áudio
    return { falado: false, cancelado: false, erro: 'volume zerado' }
  }

  try {
    const Ctor = (typeof window !== 'undefined' && window.SpeechSynthesisUtterance) ||
      (typeof SpeechSynthesisUtterance !== 'undefined' ? SpeechSynthesisUtterance : null)
    if (!Ctor) return { falado: false, cancelado: false, erro: 'SpeechSynthesisUtterance indisponível' }
    const u = new Ctor(texto)
    u.lang = opcoesAtivas.lang
    u.voice = vozEscolhida
    u.pitch = opcoesAtivas.pitch
    u.rate = opcoesAtivas.rate * (modoAcelerado ? 1.18 : 1)
    u.volume = opcoesAtivas.volume

    let acabou = false
    u.onend = () => { acabou = true; vozAtiva = null }
    u.onerror = (e) => { cancelado = true; vozAtiva = null }
    u.onboundary = (ev) => {
      // aqui o hook consumidor pode usar para pintar a palavra ativa
      despacharEvento('boundary', ev)
    }

    vozAtiva = u
    window.speechSynthesis.speak(u)

    if (esperarAcabamento) {
      await new Promise((resolve) => {
        const onEnd = () => { resolve() }
        u.addEventListener('end', onEnd, { once: true })
        setTimeout(() => resolve(), 6000)
      })
    }

    return { falado: true, cancelado: false }
  } catch (erro) {
    return { falado: false, cancelado: false, erro: erro?.message ?? String(erro) }
  }
}

/**
 * buscar voz e cache
 */
async function buscarVozAtiva() {
  if (vozCache) return vozCache
  const v = await esperarVozes()
  const escolhida = escolherVoz(v)
  if (escolhida) vozCache = escolhida
  return escolhida
}

/**
 * baixo nível: espera pelo voicechanged e reto
 */
export async function esperarVozesComCache() {
  if (vozCache) return vozCache
  const v = await esperarVozes(4000)
  const escolhida = escolherVoz(v)
  if (escolhida) vozCache = escolhida
  return escolhida
}

/**
 * cancelar fala em andamento, silenciosamente
 */
export function cancelar() {
  if (!('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel?.()
  } catch { /* ignorar */ }
  vozAtiva = null
  cancelado = true
}

/**
 * pular fala atual (equivalente ao botão "ouvir de novo" no balão)
 */
export function pularFala() {
  cancelar()
  despacharEvento('pular')
}

/**
 * ativar/desativar modo voice aleatório (ligado por padrão se usuário já interagiu)
 */
export function setVozLigada(ligada) {
  if (!ligada) cancelar()
  opcoesAtivas.volume = ligada ? PADRAO.volume : 0
}

/**
 * usar volumes menores
 */
export function setVolumeAVoz(vol) {
  // aceita fração (0..1) ou porcentagem (0..100); normaliza para fração
  const n = Number(vol)
  const fracao = n > 1 ? n / 100 : n
  opcoesAtivas.volume = Math.max(0, Math.min(1, fracao))
}

/**
 * velocidade (rate) — convém usar no modal de velocidade
 */
export function setVelocidadeVoz(v) {
  opcoesAtivas.rate = Math.max(0.5, Math.min(1.5, v))
}

/**
 * trocar apelo de voz para "lenta" ou "normal"
 */
export function setModoVelocidadeVoz(modo) {
  // aceita 'lenta'/'lento' (devagar) e 'normal'/'rapida' (padrão)
  const m = String(modo ?? '').toLowerCase()
  if (m === 'lenta' || m === 'lento' || m === 'devagar') opcoesAtivas.rate = 0.78
  else opcoesAtivas.rate = 0.92
}

// ---------------------------------------------------------------------------
// eventos de sincronia (para os que consomem)
// ---------------------------------------------------------------------------
const ouvintesBoundary = new Set()
const ouvintesPular = new Set()

function despacharEvento(tipo, payload) {
  if (tipo === 'boundary') {
    ouvintesBoundary.forEach((cb) => { try { cb(payload) } catch {} })
  } else if (tipo === 'pular') {
    ouvintesPular.forEach((cb) => { try { cb(payload) } catch {} })
  }
}

/**
 * usar quando quiser destacar a palavra falada (emitida no onboundary)
 */
export function ouvirPalavraAtiva(cb) {
  ouvintesBoundary.add(cb)
  return () => {
    ouvintesBoundary.delete(cb)
  }
}

/**
 * registrar callback p/ quando o usuário pular a fala
 */
export function ouvirPularFala(cb) {
  ouvintesPular.add(cb)
  return () => { ouvintesPular.delete(cb) }
}

// ---------------------------------------------------------------------------
// integração com first-interaction e autoplay
// ---------------------------------------------------------------------------
/**
 * chamada para ser chamada uma vez só, por evento de pointer/teclado,
 * desde que não tenha acontecido antes
 */
export function registrarInteracao(jáFez = false) {
  if (jáFez) return
  marcarPrimeiraInteracao()
}

/**
 * substituição de primeira interacao manual pos-evento (ex.: quando se chama
 * falar antes de interação, avisa ao module que interação "foi feita")
 */
export function forçarPrimeiraInteracao() {
  primeiraInteracao = true
}

/**
 * true quando o usuário já interagiu ao menos uma vez (autoplay liberado).
 */
export function jaInteragiu() {
  return primeiraInteracao
}

// ---------------------------------------------------------------------------
// visibilidade: pausar quando aba não estiver focada
// ---------------------------------------------------------------------------
export function observarVisibilidade() {
  if (!('speechSynthesis' in window)) return () => {}

  const trata = () => {
    if (document.hidden) {
      try { window.speechSynthesis.cancel?.() } catch {}
      vozAtiva = null
    } else {
      // se quiser retomar? decidimos não: não retomamos automaticamente para
      // respeito do foco do usuário
    }
  }
  document.addEventListener('visibilitychange', trata)
  return () => document.removeEventListener('visibilitychange', trata)
}

// export de utilidade para quem usa: "cortar fala ao trocar de rota"
export function pararAoSairDeFoco() {
  return observarVisibilidade()
}


// ---------------------------------------------------------------------------
// helper de tempo por palavra (quando boundary não disponível)
// ---------------------------------------------------------------------------
export function estimarTempoPorPalavra(texto, rate = opcoesAtivas.rate, pitch = opcoesAtivas.pitch) {
  const palavras = (texto ?? '').split(/\s+/).filter(Boolean)
  const duracaoBase = 370 * (1 / rate) // ~27ms por palavra em rate 1.0; ajustado
  return palavras.length * duracaoBase
}

/**
 * iniciar módulo de voz: carrega vozes e aguarda primeira interação para
 * ter disponibilidade real de speech; retorna detalhes usado por hook
 */export async function iniciarModulodeVoz() {
  const depois = await temVoz()
  return {
    suportado: depois.suportado,
    ptBr: depois.ptBr,
    aguardandoInteracao: !primeiraInteracao,
  }
}

// hook não-exportado: quem usar, usa as funções acima