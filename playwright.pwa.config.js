import { defineConfig } from '@playwright/test'

// Config separada porque o PWA só existe no build: o service worker é gerado
// em `dist/sw.js` e registrado apenas em produção. Aqui o Playwright constrói
// o app, serve com `vite preview` e testa o resultado — inclusive desligando a
// rede no meio do teste.
export default defineConfig({
  testDir: './e2e-pwa',
  timeout: 90000,
  use: {
    baseURL: 'http://localhost:4173',
    headless: true,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    // Nunca reusar: um preview antigo não teria o sw.js deste build.
    reuseExistingServer: false,
    timeout: 180000,
  },
})
