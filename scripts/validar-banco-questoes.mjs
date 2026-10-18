// =========================================================
// Kids_Play — validador do banco de questões (JSON)
// Uso: node scripts/validar-banco-questoes.mjs <arquivo.json>
//
// Confere, antes de qualquer importação pro Supabase:
//   - JSON válido e campos obrigatórios em missões e atividades
//   - tipos suportados pelo app (multipla_escolha, verdadeiro_falso,
//     completar, arrastar_soltar, contar_imagens)
//   - "resposta" presente nas "opcoes" (múltipla escolha / contar)
//   - completar com respostas_aceitas; V/F com booleano
//   - arrastar: ordemEsperada = permutação exata dos ids dos itens
//   - "dados" JSONB coerente com os campos legíveis (é o que o app lê)
//   - dicas/explicação preenchidas, ids únicos, código BNCC no formato
// Sai com código 0 se tudo certo; 1 se houver problema.
// =========================================================
import { readFileSync } from 'node:fs'

const caminho = process.argv[2]
if (!caminho) {
  console.error('Uso: node scripts/validar-banco-questoes.mjs <arquivo.json>')
  process.exit(1)
}

let banco
try {
  banco = JSON.parse(readFileSync(caminho, 'utf8'))
} catch (erro) {
  console.error(`✗ JSON inválido: ${erro.message}`)
  process.exit(1)
}

const TIPOS_OK = ['multipla_escolha', 'verdadeiro_falso', 'completar', 'arrastar_soltar', 'contar_imagens']
const RE_BNCC = /^EF0[1-6](MA|LP|CN|HI|GE)\d{2}$/

let falhas = 0
let avisos = 0
const erro = (msg) => { falhas++; console.error(`✗ ${msg}`) }
const aviso = (msg) => { avisos++; console.error(`⚠ ${msg}`) }
const ok = (msg) => console.log(`✓ ${msg}`)

// --- cabeçalho ---
for (const campo of ['ano', 'materia', 'trilha', 'missoes']) {
  if (banco[campo] === undefined) erro(`falta o campo "${campo}" no topo do JSON`)
}
if (!Array.isArray(banco.missoes) || banco.missoes.length === 0) {
  console.error('✗ "missoes" vazio — nada a validar'); process.exit(1)
}
ok(`Cabeçalho: ${banco.ano} · ${banco.materia} · "${banco.trilha}" · ${banco.missoes.length} missões`)

const idsVistos = new Set()
const porDificuldade = { 1: 0, 2: 0, 3: 0 }
const porTipo = {}
let total = 0

const ehString = (v) => typeof v === 'string' && v.trim().length > 0

for (const missao of banco.missoes) {
  if (!ehString(missao.id) || !ehString(missao.titulo) || !ehString(missao.objetivo)) {
    erro(`missão sem id/título/objetivo: ${JSON.stringify(missao.id ?? '?')}`)
    continue
  }
  if (!Array.isArray(missao.atividades) || missao.atividades.length === 0) {
    erro(`missão "${missao.titulo}" sem atividades`); continue
  }

  for (const atv of missao.atividades) {
    total++
    const rotulo = atv.id ?? `#${total} (sem id)`

    if (!ehString(atv.id)) erro(`atividade sem id (missão "${missao.titulo}")`)
    if (idsVistos.has(atv.id)) erro(`id duplicado: "${atv.id}"`)
    idsVistos.add(atv.id)

    if (!TIPOS_OK.includes(atv.tipo)) erro(`${rotulo}: tipo "${atv.tipo}" não é suportado pelo app`)
    porTipo[atv.tipo] = (porTipo[atv.tipo] ?? 0) + 1

    if (![1, 2, 3].includes(atv.dificuldade)) erro(`${rotulo}: dificuldade deve ser 1, 2 ou 3`)
    else porDificuldade[atv.dificuldade]++

    for (const campo of ['habilidade', 'enunciado', 'dica1', 'dica2', 'explicacao']) {
      if (!ehString(atv[campo])) erro(`${rotulo}: campo "${campo}" vazio`)
    }
    if (ehString(atv.codigo_bncc) && !RE_BNCC.test(atv.codigo_bncc)) {
      erro(`${rotulo}: codigo_bncc "${atv.codigo_bncc}" fora do padrão EFxxMA/LP/CN/HI/GE##`)
    }
    const palavras = ehString(atv.enunciado) ? atv.enunciado.trim().split(/\s+/).length : 0
    if (palavras > 30) aviso(`${rotulo}: enunciado com ${palavras} palavras (meta: até ~25)`)

    // --- conferências por tipo ---
    if (atv.tipo === 'multipla_escolha') {
      if (!Array.isArray(atv.opcoes) || atv.opcoes.length < 3 || atv.opcoes.length > 4) {
        erro(`${rotulo}: múltipla escolha precisa de 3 ou 4 opções`)
      } else if (!atv.opcoes.includes(atv.resposta)) {
        erro(`${rotulo}: a resposta "${atv.resposta}" não está nas opções`)
      }
      const alts = atv.dados?.alternativas
      if (!Array.isArray(alts)) erro(`${rotulo}: dados.alternativas ausente`)
      else {
        const certas = alts.filter((a) => a.correta === true)
        if (certas.length !== 1) erro(`${rotulo}: dados.alternativas deve ter exatamente 1 correta (tem ${certas.length})`)
        else if (certas[0].texto !== atv.resposta) erro(`${rotulo}: alternativa marcada correta ("${certas[0].texto}") difere da resposta ("${atv.resposta}")`)
      }
    }

    if (atv.tipo === 'contar_imagens') {
      if (!Array.isArray(atv.opcoes) || !atv.opcoes.includes(atv.resposta)) {
        erro(`${rotulo}: contar_imagens precisa da resposta entre as opções`)
      } else if (atv.dados?.correta !== Number(atv.resposta)) {
        erro(`${rotulo}: dados.correta (${atv.dados?.correta}) difere da resposta ("${atv.resposta}")`)
      }
    }

    if (atv.tipo === 'completar') {
      if (typeof atv.resposta !== 'string' || atv.resposta === '___') erro(`${rotulo}: completar precisa de "resposta" preenchida`)
      if (!Array.isArray(atv.respostas_aceitas) || !atv.respostas_aceitas.includes(atv.resposta)) {
        erro(`${rotulo}: completar precisa de "respostas_aceitas" contendo a resposta`)
      }
      if (Array.isArray(atv.opcoes) && !atv.opcoes.includes(atv.resposta)) {
        erro(`${rotulo}: resposta "${atv.resposta}" não está nas opções`)
      }
      if (atv.dados?.correta !== atv.resposta) erro(`${rotulo}: dados.correta difere da resposta`)
      if (!ehString(atv.enunciado.replace(/___/, '').trim())) erro(`${rotulo}: enunciado de completar sem "___"`)
    }

    if (atv.tipo === 'verdadeiro_falso') {
      if (typeof atv.resposta !== 'boolean') erro(`${rotulo}: verdadeiro_falso exige resposta true/false`)
      if (atv.dados?.correta !== atv.resposta) erro(`${rotulo}: dados.correta difere da resposta`)
    }

    if (atv.tipo === 'arrastar_soltar') {
      const itens = atv.itens
      if (!Array.isArray(itens) || itens.length < 2) erro(`${rotulo}: arrastar_soltar precisa de itens`)
      else {
        const ids = itens.map((i) => i.id)
        if (new Set(ids).size !== ids.length) erro(`${rotulo}: ids dos itens repetidos`)
        if (!Array.isArray(atv.resposta) || atv.resposta.length !== ids.length ||
            [...ids].sort().join() !== [...atv.resposta].sort().join()) {
          erro(`${rotulo}: "resposta" deve conter todos os ids dos itens, uma vez cada`)
        }
        if (JSON.stringify(atv.dados?.ordemEsperada) !== JSON.stringify(atv.resposta)) {
          erro(`${rotulo}: dados.ordemEsperada difere da resposta`)
        }
        if (JSON.stringify(atv.dados?.itens) !== JSON.stringify(itens)) {
          erro(`${rotulo}: dados.itens difere dos itens legíveis`)
        }
      }
    }
  }
}

// --- relatório ---
ok(`Atividades: ${total} (ids únicos: ${idsVistos.size})`)
const pct = (n) => `${Math.round((n / total) * 100)}%`
ok(`Dificuldade: nível 1 = ${porDificuldade[1]} (${pct(porDificuldade[1])}) · nível 2 = ${porDificuldade[2]} (${pct(porDificuldade[2])}) · nível 3 = ${porDificuldade[3]} (${pct(porDificuldade[3])})`)
ok(`Tipos: ${Object.entries(porTipo).map(([t, n]) => `${t} = ${n}`).join(' · ')}`)

console.log('')
if (falhas === 0) {
  console.log(`BANCO VÁLIDO — ${total} atividades prontas pra importar${avisos ? ` (${avisos} aviso(s) acima)` : ''}.`)
  process.exit(0)
} else {
  console.log(`${falhas} problema(s) e ${avisos} aviso(s) — corrija antes de importar.`)
  process.exit(1)
}
