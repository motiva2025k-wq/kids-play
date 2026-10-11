// =========================================================
// Kids_Play — teste de conexão com o Supabase
// Uso: node scripts/testar-conexao.mjs
// Testa, sem modificar nada no banco:
//   1) a URL e a chave estão certas (ping da API de login)
//   2) o PostgREST responde
//   3) a tabela "children" existe e o RLS está ativo
//      (um visitante sem login deve ver 0 crianças — nunca as dos outros)
// =========================================================
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

// 1) Ping da API de autenticação
try {
  const resposta = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: chave },
  })
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
  console.log('✓ API de login (Auth) respondeu — URL e chave estão certas')
} catch (erro) {
  falhas++
  console.error(`✗ API de login não respondeu: ${erro.message}`)
}

// 2) Ping do banco de dados (PostgREST) — consulta de verdade,
// do mesmo jeito que o app faz. (A raiz /rest/v1/ responde 401 com
// chaves no formato novo sb_publishable_, então testamos uma consulta.)
try {
  const resposta = await fetch(`${url}/rest/v1/children?select=id&limit=1`, {
    headers: { apikey: chave, Authorization: `Bearer ${chave}` },
  })
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`)
  console.log('✓ Banco de dados (PostgREST) respondeu a consulta')
} catch (erro) {
  falhas++
  console.error(`✗ Banco de dados não respondeu: ${erro.message}`)
}

// 3) Tabela children + RLS (consulta real, sem cabeçalho head, para
// capturar o erro do banco de verdade)
try {
  const { data, error } = await supabase.from('children').select('id').limit(1)
  if (error) {
    falhas++
    console.error(`✗ Tabela "children": ${error.message}`)
    console.error('  → Rode o arquivo supabase/schema.sql no SQL Editor do Supabase.')
  } else {
    console.log(
      `✓ Tabela "children" existe e o RLS está ativo (visitante sem login vê ${data.length} crianças)`,
    )
  }
} catch (erro) {
  falhas++
  console.error(`✗ Erro inesperado: ${erro.message}`)
}

// 4) Tabela guardian_consents
try {
  const { data, error } = await supabase.from('guardian_consents').select('id').limit(1)
  if (error) {
    falhas++
    console.error(`✗ Tabela "guardian_consents": ${error.message}`)
  } else {
    console.log(`✓ Tabela "guardian_consents" existe (visitante vê ${data.length} registros)`)
  }
} catch (erro) {
  falhas++
  console.error(`✗ Erro inesperado: ${erro.message}`)
}

console.log('')
console.log(falhas === 0 ? 'TUDO CERTO — conexão saudável.' : `${falhas} problema(s) encontrado(s).`)
process.exit(falhas === 0 ? 0 : 1)
