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
import { escolherNavegador } from './lib/navegador.mjs'

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
