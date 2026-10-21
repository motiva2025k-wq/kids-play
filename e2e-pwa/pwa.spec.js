import { test, expect } from '@playwright/test'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Estes testes rodam contra o BUILD (`vite preview`), porque o service worker
// só é gerado em `dist/` e só é registrado em produção. Use `npm run testar-pwa`.

/** Primeira visita, espera o SW assumir e recarrega para ficar controlado. */
async function comServiceWorker(page) {
  await page.goto('/perfis')
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload()
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {
      timeout: 15000,
    })
    .toBe(true)
}

test.describe('PWA', () => {
  test('o service worker é gerado, registra e controla a página', async ({ page }) => {
    await comServiceWorker(page)

    const sw = await page.request.get('/sw.js')
    expect(sw.status()).toBe(200)
    const codigo = await sw.text()
    expect(codigo).toContain('kids-play-app-')
    // A lista de precache precisa ter o app de verdade, não só um placeholder.
    expect(codigo).toContain('/index.html')
  })

  test('manifest e ícones estão prontos para instalar', async ({ page }) => {
    const resposta = await page.request.get('/manifest.webmanifest')
    expect(resposta.status()).toBe(200)

    const manifest = await resposta.json()
    expect(manifest.name).toBe('Kids_Play')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/')
    expect(manifest.theme_color).toBe('#6D28D9')

    const tamanhos = manifest.icons.map((i) => i.sizes)
    expect(tamanhos).toContain('192x192')
    expect(tamanhos).toContain('512x512')
    // Instalável de verdade no Android só com um ícone maskable declarado.
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true)

    for (const icone of manifest.icons.filter((i) => i.type === 'image/png')) {
      const r = await page.request.get(icone.src)
      expect(r.status(), `ícone ${icone.src}`).toBe(200)
      expect(r.headers()['content-type']).toContain('image/png')
    }
  })

  test('o cache guarda o build inteiro', async ({ page }) => {
    await comServiceWorker(page)

    const cache = await page.evaluate(async () => {
      const nomes = await caches.keys()
      const doApp = nomes.find((n) => n.startsWith('kids-play-app-'))
      if (!doApp) return { nome: null, total: 0 }
      const c = await caches.open(doApp)
      return { nome: doApp, total: (await c.keys()).length }
    })

    expect(cache.nome).toBeTruthy()
    // JS, CSS, fontes, ícones, webp do Kapivarus e o manifest.
    expect(cache.total).toBeGreaterThan(5)
  })

  test('abre e joga sem servidor depois da primeira visita', async ({ page, context }) => {
    await comServiceWorker(page)

    // Perfil criado ainda online, para o teste não depender de cadastro.
    await page.goto('/criar-perfil')
    await page.getByLabel('Apelido da criança').fill('Off')
    await page.getByRole('button', { name: '3º ano' }).click()
    await page.getByRole('button', { name: 'Salvar perfil' }).click()
    await expect(page).toHaveURL(/\/perfis/)
    // A missão só abre com uma criança escolhida.
    await page.getByRole('button', { name: /Off/ }).click()
    await expect(page).toHaveURL(/\/painel/)

    // A partir daqui não existe rede: só o que o service worker guardou.
    await context.setOffline(true)

    await page.goto('/perfis')
    await expect(page.getByRole('heading', { name: 'Quem vai estudar hoje?' })).toBeVisible()
    await expect(page.getByText('Off')).toBeVisible()

    // Navegar por rota nova offline: o SW devolve o index.html do cache.
    await page.goto('/missao/mat3-mult-m1')
    await expect(
      page.getByRole('heading', { name: /Quantos pães há no total/ }),
    ).toBeVisible({ timeout: 20000 })

    // E responder funciona: prova que o bundle e o conteúdo estão em cache.
    await page.getByRole('button', { name: 'Entendi' }).click()
    await page.getByRole('button', { name: '8', exact: true }).click()
    await expect(page.getByText(/Pergunta 2 de 6/)).toBeVisible()
  })

  test('avisa quando há versão nova e recarrega só quando alguém aceita', async ({ page }) => {
    await comServiceWorker(page)
    await page.goto('/perfis')

    // Simula um deploy: o sw.js servido muda de versão, como aconteceria
    // depois de um build novo.
    const arquivo = join(process.cwd(), 'dist', 'sw.js')
    const original = readFileSync(arquivo, 'utf8')
    const versaoDeTeste = `teste-${Date.now()}`
    writeFileSync(
      arquivo,
      original.replace(/const VERSAO = '[^']+'/, `const VERSAO = '${versaoDeTeste}'`),
    )

    try {
      const faixa = page.getByTestId('aviso-atualizacao')

      await page.evaluate(async () => {
        const registro = await navigator.serviceWorker.getRegistration()
        await registro.update()
      })

      await expect(faixa).toBeVisible({ timeout: 20000 })
      await expect(faixa).toContainText(/Versão nova/)

      // "Depois" esconde a faixa sem recarregar nem trocar de versão.
      await faixa.getByRole('button', { name: 'Depois' }).click()
      await expect(faixa).toHaveCount(0)

      // Recarregar não perde o aviso: a versão nova continua esperando.
      await page.reload()
      await expect(page.getByTestId('aviso-atualizacao')).toBeVisible({ timeout: 15000 })

      // Agora sim: a página recarrega já na versão nova.
      await Promise.all([
        page.waitForEvent('load', { timeout: 20000 }),
        page.getByRole('button', { name: 'Atualizar agora' }).click(),
      ])
      await expect(page.getByTestId('aviso-atualizacao')).toHaveCount(0)

      // Prova que a versão nova assumiu: só o cache dela sobrou.
      const cachesDoApp = await page.evaluate(() =>
        caches.keys().then((nomes) => nomes.filter((n) => n.startsWith('kids-play-app-'))),
      )
      expect(cachesDoApp).toHaveLength(1)
      expect(cachesDoApp[0]).toContain(versaoDeTeste)
    } finally {
      writeFileSync(arquivo, original)
    }
  })
})
