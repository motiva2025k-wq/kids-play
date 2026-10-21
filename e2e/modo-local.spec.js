import { test, expect } from '@playwright/test'

// Estes testes assumem o app rodando com VITE_MODO_LOCAL=1 (use
// `npm run testar-modo-local`, que liga a flag para o dev server).
//
// Cada teste ganha um contexto novo, então o localStorage começa vazio:
// não há perfil nem tentativa de outro teste atrapalhando.

async function criarPerfil(page, { apelido = 'Bia', ano = '3º ano' } = {}) {
  await page.goto('/criar-perfil')
  await page.getByLabel('Apelido da criança').fill(apelido)
  await page.getByRole('button', { name: ano }).click()
  await page.getByRole('button', { name: 'Salvar perfil' }).click()
  await expect(page).toHaveURL(/\/perfis/)
  // Escolhe o perfil recém-criado para entrar como criança.
  await page.getByRole('button', { name: new RegExp(apelido) }).click()
  await expect(page).toHaveURL(/\/painel/)
}

test.describe('modo local', () => {
  test('o app abre sem Supabase e sem o aviso de configuração', async ({ page }) => {
    await page.goto('/perfis')

    // O gate antigo mostrava "Falta conectar o banco de dados".
    await expect(page.getByText('Falta conectar o banco de dados')).toHaveCount(0)

    // Sem tela de login no modo local: a rota protegida deixa passar.
    await expect(page).toHaveURL(/\/perfis/)
  })

  test('não faz requisições para o Supabase', async ({ page }) => {
    const chamadasSupabase = []
    page.on('request', (r) => {
      if (r.url().includes('supabase.co')) chamadasSupabase.push(r.url())
    })

    await page.goto('/perfis')
    await page.waitForLoadState('networkidle')

    expect(chamadasSupabase).toEqual([])
  })

  test('cria perfil e chega ao painel', async ({ page }) => {
    await criarPerfil(page, { apelido: 'Bia' })

    await page.goto('/perfis')
    await expect(page.getByText('Bia')).toBeVisible()
  })

  test('missão offline carrega o conteúdo embarcado', async ({ page }) => {
    const erros = []
    page.on('pageerror', (e) => erros.push(e.message))

    await criarPerfil(page, { apelido: 'Gui' })

    // Matéria embarcada: 3º ano, multiplicação. O id vem do conteúdo gerado.
    await page.goto('/missao/mat3-mult-m1')
    // O primeiro carregamento em dev transforma os módulos na hora e passa
    // fácil dos 5s padrão; o conteúdo é o mesmo, só demora mais na primeira vez.
    await expect(page.getByRole('heading', { name: /Quantos pães há no total/ })).toBeVisible({
      timeout: 20000,
    })

    expect(erros).toEqual([])
  })

  test('cada ano mostra as missões do seu próprio conteúdo', async ({ page }) => {
    // 3º ano: multiplicação do 2 ao 5.
    await criarPerfil(page, { apelido: 'Lia', ano: '3º ano' })
    await page.goto('/mapa-de-missoes')
    await expect(page.getByText('A Padaria do Kapivarus')).toBeVisible()

    // 2º ano: adição e subtração. Não pode aparecer a trilha do 3º.
    await page.goto('/criar-perfil')
    await page.getByLabel('Apelido da criança').fill('Dudu')
    await page.getByRole('button', { name: '2º ano' }).click()
    await page.getByRole('button', { name: 'Salvar perfil' }).click()
    await page.getByRole('button', { name: /Dudu/ }).click()

    await page.goto('/mapa-de-missoes')
    await expect(page.getByText('A Feira do Kapivarus')).toBeVisible()
    await expect(page.getByText('A Padaria do Kapivarus')).toHaveCount(0)
  })
})
