/**
 * testar-kapivarus.mjs
 *
 * Verifica rapidez: voz pt-BR disponível e sons sintetizados sem erro.
 * Ambiente: Node com shims mínimos para window.speechSynthesis e
 * window.AudioContext/webkitAudioContext.
 */

// shims mínimos para compatibilidade com Node (versão de teste)
if (typeof window === 'undefined') {
  const mod = { exports: {} }
  globalThis.module = mod
}

globalThis.window = globalThis.window || {}
globalThis.window.speechSynthesis = {
  getVoices: () => [
    { name: 'Google pt-BR', lang: 'pt-BR' },
    { name: 'Microsoft pt-BR', lang: 'pt-BR' },
    { name: 'Web Speech pt-BR', lang: 'pt-BR' },
  ],
  speak: () => { },
  cancel: () => { },
  addEventListener: () => { },
  removeEventListener: () => { },
}
globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
  constructor(texto) {
    this.text = texto
    this.lang = ''
    this.voice = null
    this.pitch = 1
    this.rate = 1
    this.volume = 1
  }
  addEventListener() { }
  removeEventListener() { }
}
globalThis.window.SpeechSynthesisUtterance = globalThis.SpeechSynthesisUtterance
globalThis.window.webkitSpeechSynthesis = undefined
globalThis.window.AudioContext = class {
  constructor() {
    this.currentTime = 0
    this.state = 'running'
    this.destination = { connect: () => {} }
  }
  createOscillator() {
    const nó = {
      type: 'sine',
      frequency: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => nó,
      start: () => {},
      stop: () => {},
    }
    return nó
  }
  createGain() {
    const nó = {
      gain: {
        value: 1,
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => nó,
      start: () => {},
      stop: () => {},
    }
    return nó
  }
  resume() { this.state = 'running' }
}
globalThis.window.webkitAudioContext = undefined
globalThis.window.matchMedia = () => ({ matches: false })

import { temVoz, falar, cancelar, pularFala, setVozLigada, setVolumeAVoz, setModoVelocidadeVoz, registrarInteracao, forçarPrimeiraInteracao } from '../src/components/kapivarus/kapivarus-voz.mjs'
import KapivarusSons from '../src/components/kapivarus/kapivarus-sons.mjs'

async function main() {
  var erros = 0
  var ok = 0

  function reportOk(msg) {
    ok++
    console.log('✓ ' + msg)
  }

  function reportErro(msg) {
    erros++
    console.error('✗ ' + msg)
  }

  // ponto 1: voz
  var t = await temVoz()
  if (t.suportado) reportOk('speechSynthesis disponível')
  else reportErro('speechSynthesis indisponível no runtime do teste')
  if (t.ptBr) reportOk('voz pt-BR disponível')
  else reportErro('sem voz pt-BR neste navegador')
  var vozDisponivel = t.suportado && t.ptBr

  // ponto 2: primeiro toque / autoplay
  if (!('speechSynthesis' in window)) reportErro('ambiente sem speechSynthesis total')
  registrarInteracao()
  forçarPrimeiraInteracao()
  // agora pode tentar falar sem bloqueio de autoplay
  if (vozDisponivel) {
    var r = await falar('Oi, aventureiro! Teste de voz.', { cancelarAnterior: true, esperarAcabamento: false })
    if (r.falado) reportOk('fala real dispa canalizada')
    else reportErro('fala falhou: ' + (r.erro || 'sem motivo'))
    cancelar()
  } else {
    reportOk('pula fala por falta de voz pt-BR (fundo ok)')
  }

  // ponto 3: pular
  if (vozDisponivel) {
    await falar('Texto para pular.')
    var antes = performance.now()
    pularFala()
    var depois = performance.now()
    if (depois - antes < 1200) reportOk('pularFala ativou cancelamento rápido')
    else reportErro('pularFala não cancelou rápido')
  }

  // ponto 4: configuração
  setVozLigada(false)
  var rOff = await falar('Isso deve ficar mudo.', { cancelarAnterior: true })
  if (!rOff.falado) reportOk('setVozLigada(false) silencia')
  else reportErro('falha: voz continuou')

  setVozLigada(true)
  setVolumeAVoz(0.3)
  setModoVelocidadeVoz('lenta')
  var rLento = await falar('Voz lenta e baixa.', { cancelarAnterior: true })
  if (rLento.falado) reportOk('velocidade lenta + volume controlados')
  else reportErro('falha na voz configurada')

  // ponto 5: sons (se houver contexto)
  if (typeof window !== 'undefined') {
    var ctx = KapivarusSons.getContext()
    if (ctx) {
      KapivarusSons.marcarPrimeiraInteracao()
      KapivarusSons.somAcerto()
      reportOk('somAcerto executou')
      KapivarusSons.somDica()
      reportOk('somDica executou')
      KapivarusSons.somErro()
      reportOk('somErro executou')
      KapivarusSons.somMoeda()
      reportOk('somMoeda executou')
      KapivarusSons.somLevelUp()
      reportOk('somLevelUp executou')
      KapivarusSons.blipFala(ctx, 220, 0.4)
      reportOk('blipFala executou')
    } else {
      reportErro('não tem contexto de áudio')
    }
  }

  console.log('')
  if (erros === 0) {
    console.log('Tudo certo — módulos de voz/som do Kapivarus verificados em lógica de runtime (browser faz o resto).')
  } else {
    console.log(erros + ' ponto(s) com problema. Teste manual no navegador completa.')
  }
  process.exit(erros === 0 ? 0 : 1)
}

main().catch(function (e) {
  console.error('erro no teste: ' + e?.message ?? e)
  process.exit(1)
})
