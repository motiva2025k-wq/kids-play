#!/usr/bin/env node
// Roda o teste do PWA com VITE_MODO_LOCAL=1.
//
// O teste de "sem servidor" precisa de um app que funcione offline por
// completo; no modo online a tela de perfis depende do Supabase. A flag vale
// para o build feito pelo `webServer` do Playwright (config separada em
// playwright.pwa.config.js), então não mexe no .env.local de ninguém.
import { spawn } from 'node:child_process'

console.log('\n  ⚠ Nenhum `npm run dev` / `npm run preview` na porta 4173.\n')

const filho = spawn('npx', ['playwright', 'test', '-c', 'playwright.pwa.config.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_MODO_LOCAL: '1' },
})

filho.on('exit', (codigo) => process.exit(codigo ?? 1))
