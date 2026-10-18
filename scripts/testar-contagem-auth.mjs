// =========================================================
// Kids_Play — teste AUTENTICADO do seed
// Uso: node scripts/testar-contagem-auth.mjs
//
// Cria uma conta de teste descartável (email @example.com, não
// pertence a ninguém) e confere, COMO USUÁRIO LOGADO (que é o
// papel que o app usa), as contagens do seed do src/views.sql:
//   5 matérias · 6 missões · 36 perguntas
// e a pergunta que faltava antes da correção do seed
// ("6 - 2 = ?", ordem 1 da missão "Tire e veja o que sobra").
//
// Observação: a conta de teste fica em auth.users (sem a service
// key não dá pra apagá-la daqui) — use um email de mentira mesmo.
// =========================================================
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function lerEnvLocal() {
  const mapa = {}
  for (const linha of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const limpa = linha.trim()
    if (!limpa || limpa.startsWith('#')) continue
    const [chave, ...resto] = limpa.split('=')
    mapa[chave.trim()] = resto.join('=').trim()
  }
  return mapa
}

const env = lerEnvLocal()
const url = env.VITE_SUPABASE_URL
const chave = env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  console.error('✗ .env.local incompleto: faltam VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, chave)
let falhas = 0

// 1) Cria a conta de teste e entra com ela
const email = `teste.kidsplay+${randomUUID().slice(0, 8)}@example.com`
const senha = `Teste-${randomUUID().slice(0, 12)}!`

const { data: cadastro, error: erroCadastro } = await supabase.auth.signUp({
  email,
  password: senha,
})

if (erroCadastro) {
  console.error(`✗ Não deu pra criar a conta de teste: ${erroCadastro.message}`)
  process.exit(1)
}
if (!cadastro.session) {
  // O projeto exige confirmação de e-mail: sem a service key não dá pra
  // confirmar daqui. Nada foi logado — avisamos e saímos.
  console.error('✓ Conta criada, mas o projeto exige CONFIRMAÇÃO DE E-MAIL (session veio nula).')
  console.error('  Sem a service key não dá pra confirmar daqui. Opções:')
  console.error('  1) Dashboard → Authentication → Sign In / Providers → Email → desmarque')
  console.error('     "Confirm email" temporariamente e rode este script de novo;')
  console.error('  2) Me passe um login já existente (email + senha) para eu testar com ele.')
  console.error(`  (a conta criada e não confirmada foi: ${email})`)
  process.exit(1)
}
console.log(`✓ Conta de teste criada e logada: ${email}`)

// 2) Contagens como usuário autenticado — é o mesmo papel que o app usa
const esperado = { materias: 5, missoes: 6, perguntas: 36 }
for (const [tabela, alvo] of Object.entries(esperado)) {
  const { count, error } = await supabase.from(tabela).select('id', { count: 'exact', head: true })
  if (error) {
    falhas++
    console.error(`✗ ${tabela}: ${error.message}`)
  } else if (count === alvo) {
    console.log(`✓ ${tabela}: ${count} linhas (esperado ${alvo})`)
  } else {
    falhas++
    console.error(`✗ ${tabela}: ${count} linhas, esperado ${alvo}`)
  }
}

// 3) A pergunta que faltava antes da correção do seed
const { data: faltando, error: erroConsulta } = await supabase
  .from('perguntas')
  .select('id, tipo, enunciado, ordem, missoes(titulo)')
  .eq('ordem', 1)
  .eq('tipo', 'multipla_escolha')
  .eq('enunciado', '6 - 2 = ?')

if (erroConsulta) {
  falhas++
  console.error(`✗ consulta da pergunta que faltava: ${erroConsulta.message}`)
} else if (faltando.length === 1) {
  console.log(
    `✓ pergunta que faltava existe: "${faltando[0].enunciado}" — ordem 1 da missão "${faltando[0].missoes.titulo}"`,
  )
} else {
  falhas++
  console.error(`✗ pergunta "6 - 2 = ?" (ordem 1) não encontrada — ${faltando.length} resultados`)
}

// 4) Amostra das perguntas de uma missão, pra provar que o JSONB é legível
const { data: amostra, error: erroAmostra } = await supabase
  .from('perguntas')
  .select('ordem, tipo, dados')
  .eq('missao_id', (await supabase.from('missoes').select('id').eq('titulo', 'Tire e veja o que sobra').single()).data.id)
  .order('ordem')

if (erroAmostra) {
  falhas++
  console.error(`✗ amostra de perguntas: ${erroAmostra.message}`)
} else {
  const tipos = amostra.map((p) => `${p.ordem}:${p.tipo}`).join(', ')
  const comDados = amostra.filter((p) => p.dados && Object.keys(p.dados).length > 0).length
  console.log(`✓ missão "Tire e veja o que sobra" tem ${amostra.length} perguntas — tipos: ${tipos}`)
  if (comDados === amostra.length) {
    console.log(`✓ todas as ${comDados} têm JSONB em "dados"`)
  } else {
    falhas++
    console.error(`✗ só ${comDados} de ${amostra.length} perguntas têm JSONB preenchido`)
  }
}

console.log('')
console.log(falhas === 0 ? 'TUDO CERTO — seed validado como usuário logado.' : `${falhas} problema(s) encontrado(s).`)
process.exit(falhas === 0 ? 0 : 1)
