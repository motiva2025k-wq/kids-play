#!/usr/bin/env node
// Instala o Kids_Play para uso local (offline).
// Uso: npm run instalar-local
import { execFileSync, execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const envLocal = join(raiz, '.env.local')
const MINIMO = [20, 19]

function titulo(t) {
  console.log(`\n  ${t}`)
}
function ok(t) {
  console.log(`    ✓ ${t}`)
}
function erro(t) {
  console.error(`    ✗ ${t}`)
}

// 1. Node
const [maior, menor] = process.versions.node.split('.').map(Number)
if (maior < MINIMO[0] || (maior === MINIMO[0] && menor < MINIMO[1])) {
  erro(`Node ${process.versions.node} é antigo. Precisa de ${MINIMO[0]}.${MINIMO[1]} ou mais novo.`)
  erro('Baixe em https://nodejs.org e rode de novo.')
  process.exit(1)
}
titulo('1/5 Node')
ok(`Node ${process.versions.node}`)

// 2. Dependências
titulo('2/5 Dependências')
try {
  // execSync (com shell) e não execFileSync: no Windows o npm é um .cmd e
  // precisaria de shell de todo jeito — assim também sai o aviso DEP0190.
  execSync('npm install --no-audit --no-fund', {
    cwd: raiz,
    stdio: 'inherit',
  })
  ok('dependências instaladas')
} catch {
  erro('o npm install falhou. Rode `npm install` manualmente para ver o erro.')
  process.exit(1)
}

// 3. .env.local
titulo('3/5 Variáveis de ambiente')
const FLAG = 'VITE_MODO_LOCAL=1'
if (existsSync(envLocal)) {
  const conteudo = readFileSync(envLocal, 'utf8')
  if (conteudo.includes('VITE_MODO_LOCAL')) {
    ok('.env.local já tem VITE_MODO_LOCAL — mantido')
  } else {
    writeFileSync(envLocal, `${conteudo.replace(/\s*$/, '\n')}${FLAG}\n`, 'utf8')
    ok('linha VITE_MODO_LOCAL=1 acrescentada (chaves existentes mantidas)')
  }
} else {
  writeFileSync(
    envLocal,
    `# Modo local: roda sem Supabase e sem internet.\n# Remova esta linha para voltar a usar o Supabase.\n${FLAG}\n`,
    'utf8',
  )
  ok('.env.local criado com VITE_MODO_LOCAL=1')
}

// 4. Conteúdo
titulo('4/5 Conteúdo das missões')
try {
  execFileSync(process.execPath, [join(raiz, 'scripts', 'gerar-conteudo-local.mjs')], {
    cwd: raiz,
    stdio: 'inherit',
  })
} catch {
  erro('não deu para gerar o conteúdo local.')
  process.exit(1)
}

// 5. Pronto
titulo('5/5 Pronto')
console.log(`
    Tudo instalado. Para abrir o app:

        npm run dev

    Depois abra http://localhost:5173

    Para voltar a usar o Supabase, remova a linha
    VITE_MODO_LOCAL=1 do arquivo .env.local.
`)
