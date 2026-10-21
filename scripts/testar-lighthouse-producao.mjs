#!/usr/bin/env node
// Roda o Lighthouse contra o site publicado na Vercel (produção), como o CI
// faz na agenda. Aqui não existe build local: quem manda é o deploy.
//
// Duas variáveis de ambiente afinam o alvo, e nenhum segredo entra no git:
//
// - URL_PRODUCAO: sobrepõe a URL do `lighthouserc.producao.json`. O CI descobre
//   a cada run qual é o deploy de produção mais novo (a URL única do deploy
//   muda a cada publicação) e passa por aqui.
// - VERCEL_PROTECTION_BYPASS: a produção está atrás da proteção da Vercel. O
//   valor (secret do GitHub Actions) é injetado como header
//   `x-vercel-protection-bypass` numa configuração temporária gerada abaixo —
//   o Lighthouse envia o header em todas as requisições e o secret fica fora
//   do repositório e fora do histórico.
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { escolherNavegador } from './lib/navegador.mjs'

escolherNavegador()

const config = JSON.parse(readFileSync('lighthouserc.producao.json', 'utf8'))

if (process.env.URL_PRODUCAO) {
  config.ci.collect.url = [process.env.URL_PRODUCAO]
  console.log(`  → alvo: ${process.env.URL_PRODUCAO}`)
}

if (process.env.VERCEL_PROTECTION_BYPASS) {
  config.ci.collect.settings.extraHeaders = {
    'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS,
  }
  console.log('  → proteção da Vercel: usando o secret de bypass')
}

mkdirSync('.lighthouseci', { recursive: true })
const configRuntime = path.join('.lighthouseci', 'lighthouserc.producao.runtime.json')
writeFileSync(configRuntime, JSON.stringify(config, null, 2))

const lhci = spawn('npx', ['lhci', 'autorun', `--config=${configRuntime}`], {
  stdio: 'inherit',
  shell: true,
})

lhci.on('exit', (codigo) => process.exit(codigo ?? 1))
