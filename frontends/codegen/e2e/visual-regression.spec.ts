import { test, expect } from '@playwright/test'

test.describe('visual regression', () => {
  test('json conversion showcase', async ({ page }) => {
    test.setTimeout(60000)
    await page.goto('/codegen/json-conversion-showcase', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    // Wait for fonts to load before taking screenshot
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1000)

    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    })
    await expect(page).toHaveScreenshot('json-conversion-showcase.png', {
      fullPage: true,
      timeout: 20000,
      maxDiffPixelRatio: 0.01,
    })
  })
})
