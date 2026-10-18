// progresso.js — fonte única de progresso da criança no aparelho.
//
// Guarda em localStorage: XP total, nível, moedas, dias seguidos (streak),
// meta diária e a data da última missão concluída.
//
// Serve de base para:
//   • Home (HUD com valores reais, sem números fixos);
//   • MissaoNova (detectar "subiu de nível" e "meta do dia" ao concluir).
//
// É conveniência local (o banco continua sendo a fonte oficial por conta do
// login); aqui só espelhamos o suficiente para as falas do Kapivarus.

const CHAVE = 'kids_play_progresso_v1'

// Regras de progressão (fáceis de ajustar).
export const XP_POR_NIVEL = 100      // XP necessário para subir 1 nível
export const XP_POR_ESTRELA = 5      // XP ganho por estrela na missão
export const MOEDAS_POR_ESTRELA = 4  // moedas ganhas por estrela
export const META_DIARIA_XP = 30     // XP da "meta do dia"

const PADRAO = {
  xp: 0,
  nivel: 1,
  moedas: 0,
  diasSeguidos: 0,
  ultimoDiaComMissao: null, // 'YYYY-MM-DD' da última missão concluída
  metaDiariaBatida: false,  // já bateu a meta hoje?
  xpHoje: 0,                // XP ganho no dia acima
}

function dataDe(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`
}

function ler() {
  try {
    const cru = localStorage.getItem(CHAVE)
    if (!cru) return { ...PADRAO }
    const obj = JSON.parse(cru)
    return { ...PADRAO, ...(obj && typeof obj === 'object' ? obj : {}) }
  } catch {
    return { ...PADRAO }
  }
}

function guardar(obj) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(obj))
  } catch {
    // sem localStorage (modo privado/cheio): segue sem persistir, não quebra
  }
  return obj
}

/** lê o progresso atual. */
export function carregarProgresso() {
  return ler()
}

/** zera a meta/xpHoje quando o dia vira (chamar na Home ao montar). */
export function atualizarDia() {
  const p = ler()
  const d = dataDe()
  if (p.ultimoDiaComMissao !== d) {
    // é um dia novo desde a última missão: zera o contador diário
    p.metaDiariaBatida = false
    p.xpHoje = 0
  }
  guardar(p)
  return p
}

/** aplica o ganho de uma missão concluída.
 *  Retorna { progresso, subiuDeNivel, metaDoDia }. */
export function aplicarResultadoMissao({ estrelas = 0 } = {}) {
  const p = ler()
  const d = dataDe()

  // se a última missão foi outro dia, o XP de "hoje" começa do zero
  const primeiroJogoHoje = p.ultimoDiaComMissao !== d
  const xpHojeAntes = primeiroJogoHoje ? 0 : p.xpHoje

  const ganhoXp = Math.max(0, Math.round(estrelas * XP_POR_ESTRELA))
  const ganhoMoedas = Math.max(0, Math.round(estrelas * MOEDAS_POR_ESTRELA))

  const xp = p.xp + ganhoXp
  const moedas = p.moedas + ganhoMoedas

  // subiu de nível? (a cada XP_POR_NIVEL = 1 nível)
  const nivelAnterior = p.nivel
  const nivel = Math.max(1, Math.floor(xp / XP_POR_NIVEL) + 1)
  const subiuDeNivel = nivel > nivelAnterior

  // meta do dia: XP de hoje (incluindo este ganho) atinge a meta
  const xpHoje = xpHojeAntes + ganhoXp
  const metaDoDia = !p.metaDiariaBatida && xpHoje >= META_DIARIA_XP

  const novo = {
    ...p,
    xp,
    moedas,
    nivel,
    xpHoje,
    ultimoDiaComMissao: d,
    metaDiariaBatida: p.metaDiariaBatida || metaDoDia,
  }

  guardar(novo)
  return { progresso: novo, subiuDeNivel, metaDoDia }
}

/** marca que a criança jogou hoje e atualiza o streak de dias seguidos.
 *  Retorna { diasSeguidos, novoMarco } (novoMarco = verdadeiro em 3, 7, 14…). */
export function registrarDiaJogado() {
  const p = ler()
  const d = dataDe()

  if (p.ultimoDiaComMissao === d) {
    return { diasSeguidos: p.diasSeguidos, novoMarco: false }
  }

  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  const ontemStr = dataDe(ontem)

  // continua a sequência se jogou ontem; senão, recomeça em 1
  const diasSeguidos = p.ultimoDiaComMissao === ontemStr ? p.diasSeguidos + 1 : 1

  // marcos comemoráveis
  const MARCOS = [3, 7, 14, 30, 50, 100]
  const novoMarco = MARCOS.includes(diasSeguidos)

  const novo = { ...p, diasSeguidos, ultimoDiaComMissao: d }
  guardar(novo)
  return { diasSeguidos, novoMarco }
}

/** utilitário para telas: ano do perfil (2º, 3º, 4º). */
export function anoDoPerfil(perfil) {
  return perfil?.school_year || perfil?.ano || '2'
}
