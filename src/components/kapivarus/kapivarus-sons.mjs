/**
 * kapivarus-sons.mjs — sons de jogo 100% originais, gerados com Web Audio.
 * Nada de amostras de terceiros; tudo sintetizado no momento.
 *
 * Arquivo autônomo, sem dependências externas. Quem usar deve importar
 * as funções e chamar com um contexto de áudio (ou deixar que o próprio
 * módulo crie/manenha um contexto único).
 *
 * Nota: este arquivo usa CommonJS para ser compatível com Node em qual
 * environment.
 */

'use strict'

var instanceKey = '__kapivarusSonsContext'
var getContext = function () {
  if (typeof window === 'undefined') return null
  if (!window[instanceKey]) {
    try {
      window[instanceKey] = new (window.AudioContext || window.webkitAudioContext)()
    } catch (e) {
      window[instanceKey] = null
    }
  }
  var c = window[instanceKey]
  if (c && c.state === 'suspended') {
    try { c.resume() } catch (e) {}
  }
  return c
}

// ------------------------------------------------------------------
// integra para "primeira interação" (evita autoplay block)
// ------------------------------------------------------------------
var primeiratoque = false
var ouvintesPrimeiraInteracao = []

function marcarPrimeiraInteracao() {
  if (primeiratoque) return
  primeiratoque = true
  for (var i = 0; i < ouvintesPrimeiraInteracao.length; i++) {
    try { ouvintesPrimeiraInteracao[i]() } catch (e) {}
  }
  ouvintesPrimeiraInteracao = []
}

function aguardarPrimeiraInteracao(cb) {
  if (primeiratoque) { cb(); return }
  ouvintesPrimeiraInteracao.push(cb)
}

// registar eventos para garantir a primeira interação
if (typeof window !== 'undefined') {
  var handler = function () { marcarPrimeiraInteracao() }
  window.addEventListener('pointerdown', handler, { once: true, passive: true })
  window.addEventListener('keydown', handler, { once: true, passive: true })
  window.addEventListener('touchstart', handler, { once: true, passive: true })
}

// ------------------------------------------------------------------
// sons
// ------------------------------------------------------------------
var volumePadrao = 0.10 // baixo

/**
 * blip de fala (diálogo de jogo): varia o tom levemente a cada passo,
 * com pequenas pausas, estilo "diálogo" curtissimo.
 */
function blipFala(ctx, baseFreq, duracaoTotal, variacao) {
  if (ctx == null) ctx = getContext()
  if (!ctx) return
  if (baseFreq == null) baseFreq = 480
  if (duracaoTotal == null) duracaoTotal = 0.5
  if (variacao == null) variacao = 40

  var tempoAgora = ctx.currentTime
  var i = 0
  var comandos = Math.round(duracaoTotal * 15) // ~15 sons no total
  for (var k = 0; k < comandos; k++) {
    var t = tempoAgora + (k * 0.032)
    var f = baseFreq + Math.sin(k * 1.3) * variacao + (Math.random() * 30 - 15)
    var dc = volumePadrao * (1 - (k / comandos) * 0.4)
    if (dc <= 0.001) continue
    var osc2 = ctx.createOscillator()
    var g2 = ctx.createGain()
    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(f, t)
    g2.gain.setValueAtTime(0.0001, t)
    g2.gain.linearRampToValueAtTime(dc, t + 0.010)
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.050)
    osc2.connect(g2).connect(ctx.destination)
    osc2.start(t)
    osc2.stop(t + 0.055)
    i++
  }
}

/**
 * som de moeda: curta, estalando para cima
 */
function somMoeda(ctx, pitch) {
  if (ctx == null) ctx = getContext()
  if (!ctx) return
  if (pitch == null) pitch = 1000

  var t = ctx.currentTime
  var osc = ctx.createOscillator()
  var g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(pitch, t)
  osc.frequency.exponentialRampToValueAtTime(pitch * 1.6, t + 0.08)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(volumePadrao, t + 0.004)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.10)
  osc.connect(g).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.12)
}

/**
 * level-up: suave subida de notas (ascendente), com pequena distorção.
 */
function somLevelUp() {
  var ctxV = getContext()
  if (!ctxV) return

  var t = ctxV.currentTime
  var notas = [523.25, 659.25, 783.99, 1046.5]
  var duracoes = [0.06, 0.07, 0.08, 0.14]
  var ganhos = [0.10, 0.10, 0.09, 0.08]

  for (var L = 0; L < notas.length; L++) {
    var freq = notas[L]
    var idx = L
    var osc3 = ctxV.createOscillator()
    var g3 = ctxV.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(freq, t + idx * 0.005)
    g3.gain.setValueAtTime(0.0001, t + idx * 0.005)
    g3.gain.linearRampToValueAtTime(ganhos[idx], t + idx * 0.005 + 0.006)
    g3.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.005 + duracoes[idx])
    osc3.connect(g3).connect(ctxV.destination)
    osc3.start(t + idx * 0.005)
    osc3.stop(t + idx * 0.005 + duracoes[idx] + 0.01)
  }
}

/**
 * acerto: curtocurto estalo confiante/suave
 */
function somAcerto() {
  var ctxV = getContext()
  if (!ctxV) return

  var t = ctxV.currentTime

  function playTone(freq, startTime, duration, volume) {
    var osc = ctxV.createOscillator()
    var g = ctxV.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, startTime)
    g.gain.setValueAtTime(0.0001, startTime)
    g.gain.linearRampToValueAtTime(volume, startTime + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
    osc.connect(g).connect(ctxV.destination)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.01)
  }

  playTone(660, t, 0.08, 0.10)
  playTone(880, t + 0.003, 0.10, 0.09)
}

/**
 * "dica" sonora: levemente surgido, curto
 */
function somDica() {
  var ctxV = getContext()
  if (!ctxV) return

  var t = ctxV.currentTime
  var osc = ctxV.createOscillator()
  var g = ctxV.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(720, t)
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.12)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.06, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20)
  osc.connect(g).connect(ctxV.destination)
  osc.start(t)
  osc.stop(t + 0.22)
}

/**
 * "erro" suave (nunca agressivo): sonoro de estalo, curto, tom morno
 */
function somErro() {
  var ctxV = getContext()
  if (!ctxV) return

  var t = ctxV.currentTime
  var osc = ctxV.createOscillator()
  var g = ctxV.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(340, t)
  osc.frequency.linearRampToValueAtTime(280, t + 0.08)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.07, t + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.20)
  osc.connect(g).connect(ctxV.destination)
  osc.start(t)
  osc.stop(t + 0.22)
}

// ------------------------------------------------------------------
// export
// ------------------------------------------------------------------
export default {
  blipFala: blipFala,
  somMoeda: somMoeda,
  somLevelUp: somLevelUp,
  somAcerto: somAcerto,
  somDica: somDica,
  somErro: somErro,
  getContext: getContext,
  aguardarPrimeiraInteracao: aguardarPrimeiraInteracao,
  marcarPrimeiraInteracao: marcarPrimeiraInteracao,
  volumePadrao: volumePadrao,
}
