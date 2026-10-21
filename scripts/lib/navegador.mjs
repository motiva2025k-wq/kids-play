// Escolhe um navegador para o Lighthouse no Windows sem Chrome.
//
// O healthcheck do LHCI aborta se não achar navegador. O chrome-launcher só
// procura Chrome/Chromium — no Windows sem Chrome apontamos CHROME_PATH para
// o Chromium do Playwright (o mesmo motor dos testes E2E) ou, em último caso,
// para o Edge. No CI do GitHub Actions o Chrome já vem instalado e isto não
// faz nada (só roda no Windows).
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

export function escolherNavegador() {
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
