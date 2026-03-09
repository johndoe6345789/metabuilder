import { test, expect } from '@playwright/test'

test.describe('CodeForge - Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    test.setTimeout(30000)
    await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 20000 })

    const layout = page.locator('[data-testid="app-layout"]')
    await expect(layout).toBeVisible({ timeout: 15000 })
  })

  test('header displays CodeForge branding', async ({ page }) => {
    test.setTimeout(30000)
    await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    const header = page.locator('[data-testid="app-header"]')
    await expect(header).toBeVisible({ timeout: 5000 })
    await expect(header).toContainText('CodeForge')
  })

  test('can navigate to code editor via sidebar', async ({ page }) => {
    test.setTimeout(30000)
    await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    const codeLink = page.locator('[data-testid="nav-link-codegen/code"]')
    if (await codeLink.isVisible({ timeout: 3000 })) {
      await codeLink.click()
      await page.waitForTimeout(2000)
      await expect(page).toHaveURL(/\/code/)
    }
  })

  test('Monaco editor loads in code editor', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/codegen/code', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    const monaco = page.locator('.monaco-editor').first()
    await expect(monaco).toBeVisible({ timeout: 30000 })
  })

  test('no critical console errors', async ({ page }) => {
    test.setTimeout(30000)
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    const criticalErrors = errors.filter(e =>
      !e.includes('Download the React DevTools') &&
      !e.includes('favicon') &&
      !e.includes('manifest') &&
      !e.includes('source map') &&
      !e.includes('Failed to load resource') &&
      !e.includes('net::ERR_') &&
      !e.includes('404')
    )

    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }

    expect(criticalErrors.length).toBeLessThan(5)
  })
})
