/**
 * falas.mjs — catálogo de falas do Kapivarus.
 *
 * Lê o JSON em src/data/kapivarus-falas.json (import estático: o Vite
 * embute e cacheia junto do bundle — sem fetch extra e sem quebrar offline).
 *
 * Função principal:
 *   dizer(evento, contexto) -> { texto, estado, efeito, evento }
 *
 * Regras aplicadas aqui:
 *   • não repetir a última fala do MESMO evento (e, quando há opções, evitar
 *     a última fala dita no geral);
 *   • substituir {nome}, {xp}, {nivel}, {dias}, {moedas}, {missoes} pelos
 *     dados reais; {nome} sem valor vira "nome_padrao";
 *   • se alguma OUTRA variável faltar, escolhe outra fala que não a use
 *     (nunca mostra texto quebrado tipo "{xp}");
 *   • evento desconhecido / JSON ruim -> fala padrão + console.warn, sem
 *     quebrar a tela.
 *
 * Para mudar ou acrescentar falas: edite o JSON. Nenhum código a mexer.
 */

// No Vite o import estático de JSON funciona (embutido no bundle). No Node
// (≥ v22) o import com atributo "type: json" também funciona, então não é
// preciso createRequire — que não existe no navegador e quebra o bundle.
import catalogoEstatico from '../../data/kapivarus-falas.json' with { type: 'json' }

let catalogo = catalogoEstatico

// ---------------------------------------------------------------------------
// estado interno (memória do módulo — vale para o app inteiro)
// ---------------------------------------------------------------------------
let cfg = {
  nome_padrao: 'aventureiro(a)',
  variaveis: [],
  regras: {},
  eventos: {},
}

let ultimaFalaPorEvento = {} // evento -> texto já dito
let ultimaFalaGeral = ''     // última fala dita em qualquer evento
let ultimaInteracaoToqueMs = 0 // throttle do toque
let toquesNaTela = 0          // contador de toques (para o intervalo mínimo)

// tenta normalizar o JSON carregado; em erro, deixa cfg vazio e avisa
try {
  const base = catalogo || {}
  cfg = {
    nome_padrao: base.nome_padrao || 'aventureiro(a)',
    variaveis: Array.isArray(base.variaveis) ? base.variaveis : [],
    regras: base.regras || {},
    eventos: base.eventos || {},
  }
} catch (erro) {
  console.warn('[Kapivarus-falas] catálogo inválido, usando fallback:', erro)
}

// ---------------------------------------------------------------------------
// utilitários
// ---------------------------------------------------------------------------
function normalizarChave(evento) {
  return String(evento || '').trim().toLowerCase()
}

/** lista as variáveis (tipo "{xp}") presentes em um texto */
function variaveisNoTexto(texto) {
  const achados = texto.match(/\{[a-zA-Z_]+\}/g)
  return achados || []
}

/**
 * substitui as variáveis pelo contexto.
 * Retorna null se alguma variável (exceto {nome}) não tiver valor — assim o
 * chamador pode escolher outra fala em vez de mostrar "{xp}" quebrado.
 */
function aplicarVariaveis(texto, contexto) {
  const ctx = contexto || {}
  const nome = ctx.nome != null && ctx.nome !== '' ? ctx.nome : cfg.nome_padrao
  const faltando = []

  const resultado = texto.replace(/\{([a-zA-Z_]+)\}/g, (cheio, chave) => {
    if (chave === 'nome') return nome
    const valor = ctx[chave]
    if (valor == null || valor === '') {
      faltando.push(chave)
      return cheio // mantém o marcador; sinalizamos logo abaixo
    }
    return String(valor)
  })

  if (faltando.length) return null
  return resultado
}

/**
 * escolhe uma fala do evento já aplicando as variáveis e evitando repetição.
 */
function escolherFala(eventoInterno, contexto) {
  const def = cfg.eventos[eventoInterno]
  const lista = Array.isArray(def?.falas) ? def.falas : []
  if (!lista.length) return null

  const ultimaDeste = ultimaFalaPorEvento[eventoInterno] || ''

  // aplica as variáveis em todas; descarta as que ficariam com "{xp}" etc.
  const preenchidas = lista
    .map((f) => aplicarVariaveis(f, contexto))
    .filter((t) => t != null)
  if (!preenchidas.length) return null

  // candidatas preferenciais: não repetem a última deste evento
  let poo = preenchidas.filter((t) => t !== ultimaDeste)
  // e, quando possível, também evitam a última dita no geral
  const semGeral = poo.filter((t) => t !== ultimaFalaGeral)
  if (semGeral.length) poo = semGeral

  // relaxa a repetição só se não sobrou nenhuma opção nova
  if (!poo.length) poo = preenchidas

  return poo[Math.floor(Math.random() * poo.length)]
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/** escolhe e monta a fala de um evento. Nunca lança exceção. */
export function dizer(evento, contexto) {
  const chave = normalizarChave(evento)
  const def = cfg.eventos[chave]

  // evento desconhecido / sem definição -> fala padrão
  if (!def) {
    console.warn(`[Kapivarus-falas] evento desconhecido: "${evento}"`)
    const padrao = `Oi, ${contexto?.nome || cfg.nome_padrao}! Vamos estudar?`
    registrar(chave, padrao)
    return {
      texto: padrao,
      estado: 'neutro',
      efeito: 'suave',
      evento: chave,
    }
  }

  let texto = escolherFala(chave, contexto)

  // evento existe mas nenhuma fala coube (variáveis faltando) -> padrão
  if (texto == null) {
    console.warn(`[Kapivarus-falas] nenhuma fala aplicável em "${chave}"`)
    texto = `Oi, ${contexto?.nome || cfg.nome_padrao}! Vamos estudar?`
  }

  registrar(chave, texto)
  return {
    texto,
    estado: def.estado || 'neutro',
    efeito: def.efeito || 'suave',
    evento: chave,
  }
}

/** fala de "acordar" do volta_apos_dias (ao tocar no Kapivarus). */
export function dizerAoAcordar(contexto) {
  const def = cfg.eventos.volta_apos_dias
  const lista = Array.isArray(def?.falas_ao_acordar) ? def.falas_ao_acordar : []

  let texto = null
  if (lista.length) {
    const poo = lista.filter((f) => aplicarVariaveis(f, contexto) != null)
    if (poo.length) texto = poo[Math.floor(Math.random() * poo.length)]
    if (texto != null) texto = aplicarVariaveis(texto, contexto)
  }
  if (texto == null) {
    texto = `Bom dia, ${contexto?.nome || cfg.nome_padrao}! Vamos estudar?`
  }

  registrar('volta_apos_dias_acordar', texto)
  return {
    texto,
    estado: def?.estado_ao_tocar || 'feliz',
    efeito: def?.efeito || 'suave',
    evento: 'volta_apos_dias',
  }
}

/** pose ("estado") sugerida para um evento, sem dizer nada. */
export function estadoDe(evento) {
  return cfg.eventos[normalizarChave(evento)]?.estado || 'neutro'
}

/** efeito sugerido para um evento. */
export function efeitoDe(evento) {
  return cfg.eventos[normalizarChave(evento)]?.efeito || 'suave'
}

/** existe este evento no catálogo? */
export function existeEvento(evento) {
  return Object.prototype.hasOwnProperty.call(cfg.eventos, normalizarChave(evento))
}

/** regras do catálogo (max_palavras, intervalo_toque, ocioso…). */
export function regras() {
  return { ...cfg.regras }
}

/** o evento "volta_apos_dias" precisa do toque para acordar? */
export function precisaAcordar(evento) {
  const def = cfg.eventos[normalizarChave(evento)]
  return Boolean(def?.estado_ao_tocar || def?.falas_ao_acordar?.length)
}

/**
 * respeita o intervalo mínimo entre toques (regras.intervalo_minimo_toque_ms).
 * Retorna true se o toque pode ser respondido agora; false se veio cedo demais.
 */
export function podeTocar() {
  const min = Number(cfg.regras?.intervalo_minimo_toque_ms) || 0
  const agora = Date.now()
  if (agora - ultimaInteracaoToqueMs < min) return false
  ultimaInteracaoToqueMs = agora
  toquesNaTela += 1
  return true
}

/** zera o contador de toques (ao trocar de tela). */
export function resetarToques() {
  toquesNaTela = 0
  ultimaInteracaoToqueMs = 0
}

/** quantos toques já responderam nesta tela (para o teto de ociosidade). */
export function toquesContados() {
  return toquesNaTela
}

/**
 * deve falar "ocioso" agora?
 *  • no máximo `ocioso_max_por_tela` vezes por tela;
 *  • recebe `atividadeEmAndamento` para nunca interromper uma missão ativa.
 */
export function podeFalarOcioso({ atividadeEmAndamento = false } = {}) {
  if (atividadeEmAndamento) return false
  const max = Number(cfg.regras?.ocioso_max_por_tela) || 1
  return ociososFaladosNaTela < max
}

let ociososFaladosNaTela = 0
export function resetarOciosos() {
  ociososFaladosNaTela = 0
}
export function registrarOcioso() {
  ociososFaladosNaTela += 1
}

/** tempo de ociosidade sugerido (segundos). */
export function segundosOciosos() {
  return Number(cfg.regras?.ocioso_segundos) || 25
}

// ---------------------------------------------------------------------------
// interno: guarda o histórico de repetição
// ---------------------------------------------------------------------------
function registrar(eventoInterno, texto) {
  ultimaFalaPorEvento[eventoInterno] = texto
  ultimaFalaGeral = texto
}

export default dizer
