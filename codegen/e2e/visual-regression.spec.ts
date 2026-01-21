import { test, expect } from '@playwright/test'

test.describe('visual regression', () => {
  test('json conversion showcase', async ({ page }) => {
    await page.goto('/json-conversion-showcase')
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() => {
      const root = document.querySelector('#root')
      return root && root.textContent && root.textContent.length > 0
    })
    await page.addStyleTag({
      content: '* { transition: none !important; animation: none !important; }',
    })
    await expect(page).toHaveScreenshot('json-conversion-showcase.png', { fullPage: true })
  })
})
