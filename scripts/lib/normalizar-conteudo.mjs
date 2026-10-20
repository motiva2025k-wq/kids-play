// Normalização pura do banco de questões para o formato que o app consome.
// Sem I/O de propósito: o arquivo CLI (gerar-conteudo-local.mjs) cuida do disco,
// e esta função fica testável com `node --test`.

/** Mesmos tipos que RendererExercicios sabe renderizar. */
export const TIPOS_SUPORTADOS = [
  'multipla_escolha',
  'verdadeiro_falso',
  'completar',
  'arrastar_soltar',
  'contar_imagens',
]

/**
 * Converte um banco no formato { ano, materia, missoes:[{atividades:[]}] }
 * para o formato { ano, materia, materia_id, missoes:[{perguntas:[]}] } que
 * carregarMissaoComPerguntas() devolve.
 *
 * @returns {{ ano: string, materia: string, materia_id: string,
 *             missoes: object[], descartadas: object[] }}
 */
export function normalizarBanco(banco, { materiaId = 'local-mat' } = {}) {
  const descartadas = []
  const missoes = []
  const ano = banco?.ano ?? ''
  const materia = banco?.materia ?? ''

  for (const [i, missao] of (banco?.missoes ?? []).entries()) {
    const perguntas = []

    for (const [j, at] of (missao?.atividades ?? []).entries()) {
      const onde = { missao: missao?.id ?? `missao-${i}`, atividade: at?.id ?? `atividade-${j}` }

      if (!at?.resposta) {
        descartadas.push({ ...onde, motivo: 'sem_resposta' })
        continue
      }
      if (!TIPOS_SUPORTADOS.includes(at.tipo)) {
        descartadas.push({ ...onde, motivo: 'tipo_invalido' })
        continue
      }
      if (!at.dados || typeof at.dados !== 'object') {
        descartadas.push({ ...onde, motivo: 'sem_dados' })
        continue
      }

      perguntas.push({
        id: at.id,
        missao_id: missao.id,
        tipo: at.tipo,
        enunciado: at.enunciado ?? '',
        dados: at.dados,
        // O renderer só tem um campo `dica`, então as duas dicas do banco
        // viram uma frase só. Ver spec §5.3.
        dica: [at.dica1, at.dica2].filter(Boolean).join(' '),
        explicacao: at.explicacao ?? '',
        ordem: j + 1,
      })
    }

    // Missão sem nenhuma pergunta válida não adianta publicar.
    if (perguntas.length === 0) continue

    missoes.push({
      id: missao.id,
      titulo: missao.titulo ?? '',
      descricao: missao.objetivo ?? '',
      dificuldade: missao.dificuldade ?? 1,
      ordem: i + 1,
      ano,
      materia_id: materiaId,
      ativa: true,
      perguntas,
    })
  }

  return { ano, materia, materia_id: materiaId, missoes, descartadas }
}
