/**
 * kapivarus-preferences.mjs — camada de preferências do Kapivarus.
 *
 * Responsabilidades:
 *   1. Persistência local via localStorage (chave "kapi-preferences-v1").
 *   2. Definição do schema de preferências: voz, volume, velocidade, sons,
 *      reduzir animacoes.
 *   3. Expôr funções get/set e um helper de leitura único.
 *   4. Controle de "reduzir animações" também respeitando
 *      window.matchMedia('(prefers-reduced-motion: reduce)') como base.
 *
 * Nota técnica: o projeto (frontend Vite/React 19) não possuía uma camada
 * de persistência nominal; este módulo foca unicamente na persistência das
 * preferências do tutor. Quem usar, integra no componente/contexto como
 * preferir (ver etapa "configurações" do plano).
 */

const STORAGE_KEY = 'kapi-preferences-v1'

const PADRAO = {
  vozKapivarus: true,         // ativar/desativar voz do tutor
  volumeKapivarus: 85,        // 0..100
  velocidadeKapivarus: 'normal', // 'lenta' | 'normal'
  sonsKapivarus: true,       // sons de jogo
  reduzirAnimacao: false,    // manual override; o sistema também aplica por prefers-reduced-motion
}

const ESCOLHAS_VELOCIDADE = ['lenta', 'normal']

// ---------------------------------------------------------------------------
// helpers internos
// ---------------------------------------------------------------------------
function valueOrDefault(value, fallback) {
  return value != null ? value : fallback
}

function isWithin0To100(v) {
  return Number.isFinite(v) && v >= 0 && v <= 100
}

// ---------------------------------------------------------------------------
// prefers-reduced-motion (base, sempre respeitada)
// ---------------------------------------------------------------------------
function reduzirAnimacoesDoSistema() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// ---------------------------------------------------------------------------
// leitura/escrita com fallback estruturado
// ---------------------------------------------------------------------------
function lerDoStorage() {
  if (typeof localStorage === 'undefined') return null
  try {
    var cru = localStorage.getItem(STORAGE_KEY)
    if (!cru) return null
    var objeto = JSON.parse(cru)
    if (typeof objeto !== 'object' || objeto === null) return null
    return objeto
  } catch (e) {
    // corrupção ou bloqueio — trata como inexistente
    return null
  }
}

function persistir(objeto) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objeto))
  } catch (e) {
    // ignorar: o app não deve quebrar por localStorage cheio/bloqueado
  }
}

function clonarComValidacao(entrada) {
  var saida = Object.assign({}, PADRAO, entrada || {})
  // voz
  saida.vozKapivarus = !!saida.vozKapivarus
  // volume
  if (isWithin0To100(saida.volumeKapivarus)) {
    saida.volumeKapivarus = Math.round(saida.volumeKapivarus)
  } else {
    saida.volumeKapivarus = PADRAO.volumeKapivarus
  }
  // velocidade
  if (ESCOLHAS_VELOCIDADE.indexOf(saida.velocidadeKapivarus) >= 0) {
    // ok
  } else {
    saida.velocidadeKapivarus = PADRAO.velocidadeKapivarus
  }
  // sons
  saida.sonsKapivarus = !!saida.sonsKapivarus
  // reduzir animacoes
  saida.reduzirAnimacao = !!saida.reduzirAnimacao
  return saida
}

// ---------------------------------------------------------------------------
// objeto público
// ---------------------------------------------------------------------------
var ultimaLeitura = clonarComValidacao(lerDoStorage() || {})

/**
 * obter preferências atuais (lê do storage uma vez só)
 */
function get() {
  return Object.assign({}, ultimaLeitura)
}

/**
 * atualizar uma ou mais chaves. persistência automática.
 */
function set(parcial) {
  if (typeof parcial !== 'object' || parcial == null) return get()
  var novo = clonarComValidacao(Object.assign({}, ultimaLeitura, parcial))
  ultimaLeitura = novo
  persistir(novo)
  return Object.assign({}, novo)
}

/**
 * resetar para padrão
 */
function reset() {
  ultimaLeitura = Object.assign({}, PADRAO)
  persistir(ultimaLeitura)
  return Object.assign({}, ultimaLeitura)
}

/**
 * preferência efetiva de "reduzir animações" (combina manual + sistema +
 * o botão global "Reduzir animações" do Preferencias.jsx, que usa a chave
 * kp-reduzir-animacoes e a classe sem-animacoes no <body>).
 */
function reduzirAnimacoesEfetivas() {
  if (reduzirAnimacoesDoSistema()) return true
  if (ultimaLeitura.reduzirAnimacao) return true
  // convenção existente do projeto (Preferencias.jsx)
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('kp-reduzir-animacoes') === '1') return true
    if (typeof document !== 'undefined' && document.body?.classList.contains('sem-animacoes')) return true
  } catch (e) { /* sem storage: segue o manual */ }
  return false
}

/**
 * sons de jogo ativos? Respeita o botão global "Silenciar sons"
 * (kp-silenciar-sons / classe sem-som) e a preferência própria.
 */
function sonsAtivos() {
  if (!ultimaLeitura.sonsKapivarus) return false
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('kp-silenciar-sons') === '1') return false
    if (typeof document !== 'undefined' && document.body?.classList.contains('sem-som')) return false
  } catch (e) { /* sem storage: segue o próprio */ }
  return true
}

/**
 * volume como fração 0..1
 */
function volumeFracao() {
  var v = ultimaLeitura.volumeKapivarus
  if (!isWithin0To100(v)) v = PADRAO.volumeKapivarus
  return Math.max(0, Math.min(1, v / 100))
}

/**
 * velocidade como rate (usado pelo módulo de voz)
 */
function velocidadeRate() {
  var tipo = ultimaLeitura.velocidadeKapivarus
  if (tipo === 'lenta') return 0.78
  return 0.92
}

// ---------------------------------------------------------------------------
// exportação
// ---------------------------------------------------------------------------
var KapivarusPreferencias = {
  get: get,
  set: set,
  reset: reset,
  reduzirAnimacoesEfetivas: reduzirAnimacoesEfetivas,
  sonsAtivos: sonsAtivos,
  volumeFracao: volumeFracao,
  velocidadeRate: velocidadeRate,
  PADRAO: Object.assign({}, PADRAO),
  STORAGE_KEY: STORAGE_KEY,
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KapivarusPreferencias
} else if (typeof window !== 'undefined') {
  window.KapivarusPreferencias = KapivarusPreferencias
}

export default KapivarusPreferencias
