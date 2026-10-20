#!/usr/bin/env node
// Sobe o Playwright com VITE_MODO_LOCAL=1, de forma que funcione também no
// Windows (onde VAR=valor na frente do comando não existe) e sem alterar o
// .env.local de quem já usa o Supabase.
import { spawn } from 'node:child_process'

// O Playwright reusa um dev server já rodando (reuseExistingServer), e um
// server sem a flag faria o app apontar para o Supabase — o teste falharia
// por motivo errado. Por isso o aviso abaixo.
console.log('\n  ⚠ Nenhum `npm run dev` deve estar rodando agora.\n')

const filho = spawn('npx', ['playwright', 'test', 'e2e/modo-local.spec.js'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_MODO_LOCAL: '1' },
})

filho.on('exit', (codigo) => process.exit(codigo ?? 1))
