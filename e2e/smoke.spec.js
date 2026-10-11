import { test, expect } from '@playwright/test'

test('fluxo básico: login → ranking → loja', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('body')).toBeVisible()
  await page.goto('/ranking')
  await expect(page.locator('body')).toBeVisible()
  await page.goto('/loja')
  await expect(page.locator('body')).toBeVisible()
  await page.goto('/inventario')
  await expect(page.locator('body')).toBeVisible()
  await page.goto('/relatorios-pais')
  await expect(page.locator('body')).toBeVisible()
})
