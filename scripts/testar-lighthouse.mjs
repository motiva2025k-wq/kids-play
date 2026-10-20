#!/usr/bin/env node
// Constrói o app e roda o Lighthouse contra o `dist/`, como o CI faz.
//
// O `lhci autorun` serve o build, audita a categoria PWA três vezes e compara
// com as asserções do `lighthouserc.json`: se o app deixar de ser instalável
// (`installable-manifest`) ou perder o ícone maskable (`maskable-icon`), ele
// sai com código 1 e derruba a build.
//
// O build leva VITE_MODO_LOCAL=1 pelo mesmo motivo do `testar-pwa.mjs`: o
// resultado não pode depender das chaves do `.env.local` de quem roda.
import { spawn } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

// O healthcheck do LHCI aborta se não achar navegador. O chrome-launcher só
// procura Chrome/Chromium — no Windows sem Chrome apontamos CHROME_PATH para
// o Chromium do Playwright (o mesmo motor dos testes E2E) ou, em último caso,
// para o Edge. No CI do GitHub Actions o Chrome já vem instalado e isto não
// faz nada (só roda no Windows).
function escolherNavegador() {
  if (process.env.CHROME_PATH || process.platform !== 'win32') return

  const raizes = [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']].filter(Boolean)
  const candidatos = raizes.map((raiz) =>
    path.join(raiz, 'Google', 'Chrome', 'Application', 'chrome.exe'),
  )

  const msPlaywright =
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'ms-playwright')
  if (msPlaywright && existsSync(msPlaywright)) {
    const chromiums = readdirSync(msPlaywright)
      .filter((p) => /^chromium-\d+$/.test(p))
      .sort((a, b) => Number(b.slice('chromium-'.length)) - Number(a.slice('chromium-'.length)))
    for (const pasta of chromiums) {
      for (const binario of ['chrome-win64', 'chrome-win']) {
        candidatos.push(path.join(msPlaywright, pasta, binario, 'chrome.exe'))
      }
    }
  }

  for (const raiz of [process.env['PROGRAMFILES(X86)'], process.env.PROGRAMFILES].filter(Boolean)) {
    candidatos.push(path.join(raiz, 'Microsoft', 'Edge', 'Application', 'msedge.exe'))
  }

  const navegador = candidatos.find(existsSync)
  if (navegador) {
    process.env.CHROME_PATH = navegador
    console.log(`  → navegador: ${navegador}`)
  }
}

escolherNavegador()

const build = spawn('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_MODO_LOCAL: '1' },
})

build.on('exit', (codigoBuild) => {
  if (codigoBuild) process.exit(codigoBuild)

  const lhci = spawn('npx', ['lhci', 'autorun'], { stdio: 'inherit', shell: true })
  lhci.on('exit', (codigo) => process.exit(codigo ?? 1))
})
