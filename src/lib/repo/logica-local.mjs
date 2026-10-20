// Cálculos puros do modo local: ranking entre crianças do mesmo aparelho e
// relatório dos pais. Sem localStorage aqui — a Task 5 injeta os dados.
// Isto permite testar com `node --test`.

const DIA = 86400000

/** Chave de dia no fuso local, no formato que a tela espera. */
export function chaveDeDia(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Replica exatamente a fórmula de Ranking.jsx. Não "melhore" isto. */
export function semanaDoAno(d) {
  const ano = d.getFullYear()
  const inicio = new Date(ano, 0, 1)
  return Math.ceil(((d - inicio) / DIA + inicio.getDay() + 1) / 7)
}

/**
 * Monta a lista de ranking no shape que Ranking.jsx renderiza.
 * @param {Array} linhas  { child_id, xp_total, ano, semana, mes, mostrar_no_ranking? }
 * @param {object} p
 * @param {'semanal'|'mensal'|'global'} p.periodo
 * @param {Date} p.agora
 * @param {Array} [p.perfis] perfis locais, para preencher `children`
 */
export function montarRanking(linhas, { periodo, agora = new Date(), perfis = [] } = {}) {
  const ano = agora.getFullYear()
  const semana = semanaDoAno(agora)
  const mes = agora.getMonth() + 1
  const porId = new Map(perfis.map((p) => [p.id, p]))

  const filtradas = (linhas ?? []).filter((l) => {
    if (l.ano !== ano) return false
    // Global ignora semana/mes, igual à consulta do app online.
    if (periodo === 'semanal' && l.semana !== semana) return false
    if (periodo === 'mensal' && l.mes !== mes) return false

    const perfil = porId.get(l.child_id)
    const visivel = l.mostrar_no_ranking ?? perfil?.mostrar_no_ranking
    return visivel !== false
  })

  return filtradas
    .slice()
    .sort((a, b) => b.xp_total - a.xp_total)
    .map((l, i) => {
      const perfil = porId.get(l.child_id)
      return {
        posicao: i + 1,
        xp_total: l.xp_total,
        child_id: l.child_id,
        children: {
          id: l.child_id,
          nickname: perfil?.nickname ?? 'Criança',
          avatar_id: perfil?.avatar_id ?? null,
          mostrar_no_ranking: perfil?.mostrar_no_ranking ?? true,
          // Não existe bucket de fotos no modo local.
          mostrar_foto_no_ranking: false,
        },
      }
    })
}

function diasComMissao(tentativas, porDia) {
  for (const t of tentativas) {
    const chave = chaveDeDia(new Date(t.concluida_em))
    porDia.set(chave, (porDia.get(chave) ?? 0) + (Number(t.acertos) || 0))
  }
  return porDia
}

function inicioDoPeriodo(periodo, agora) {
  if (periodo === 'mensal') return new Date(agora.getFullYear(), agora.getMonth(), 1)
  // Semanal: últimos 7 dias, casando com os 7 quadradinhos da tela.
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 6)
}

function streak(diasOrdenados) {
  if (diasOrdenados.length === 0) return { atual: 0, maior: 0 }

  let maior = 1
  let atual = 1
  for (let i = 1; i < diasOrdenados.length; i++) {
    const anterior = new Date(`${diasOrdenados[i - 1]}T00:00:00`)
    const corrente = new Date(`${diasOrdenados[i]}T00:00:00`)
    const saoConsecutivos = (corrente - anterior) / DIA === 1
    atual = saoConsecutivos ? atual + 1 : 1
    if (atual > maior) maior = atual
  }

  return { atual, maior }
}

/**
 * Relatório dos pais, com os mesmos 7 campos do RPC `relatorio_pais`.
 * Divergência consciente do online (ver spec §5.6): aqui `total_dias` e
 * `constancia` são reais, e `periodo` é respeitado.
 */
export function calcularRelatorio(tentativas, { periodo = 'semanal', agora = new Date(), xp = 0 } = {}) {
  // O filtro de período vale para TODOS os campos, não só para os dias:
  // sem isto, o relatório mensal contava meses anteriores nos totais.
  const inicio = inicioDoPeriodo(periodo, agora)
  const validas = (tentativas ?? []).filter((t) => {
    if (!t?.concluida_em) return false
    const d = new Date(t.concluida_em)
    if (Number.isNaN(d.getTime())) return false
    return d >= inicio
  })

  const porDia = diasComMissao(validas, new Map())
  const diasOrdenados = [...porDia.keys()].sort()
  const s = streak(diasOrdenados)

  let acertos = 0
  let total = 0
  for (const t of validas) {
    acertos += Number(t.acertos) || 0
    total += Number(t.total) || 0
  }

  const constancia = {}
  // Sempre 7 entradas, para casar com os 7 quadradinhos que a tela desenha
  // — inclusive quando a criança não estudou nada (valem 0, não vazias).
  for (let i = 6; i >= 0; i--) {
    const chave = chaveDeDia(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - i))
    constancia[chave] = porDia.get(chave) ?? 0
  }

  return {
    total_dias: diasOrdenados.length,
    total_xp: Number(xp) || 0,
    total_missoes: validas.length,
    // Fração: a tela multiplica por 100. Sem tentativas, 0 (nunca NaN).
    taxa_acerto: total > 0 ? acertos / total : 0,
    streak_atual: s.atual,
    streak_maior: s.maior,
    constancia,
  }
}
