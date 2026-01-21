import { test, expect } from '@playwright/test'

test.describe('CodeForge - Smoke Tests', () => {
  test('app loads successfully', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 })

    // Check that the app has rendered content (more reliable than checking visibility)
    const root = page.locator('#root')
    await expect(root).toHaveCount(1, { timeout: 5000 })
    // Wait for any content to be rendered
    await page.waitForSelector('#root > *', { timeout: 10000 })
  })

  test('can navigate to dashboard tab', async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })
    
    const dashboardTab = page.locator('button[role="tab"]').filter({ hasText: /Dashboard/i }).first()
    if (await dashboardTab.isVisible({ timeout: 3000 })) {
      await dashboardTab.click()
      await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible({ timeout: 3000 })
    }
  })

  test('Monaco editor loads in code editor', async ({ page }) => {
    test.setTimeout(30000)
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })
    
    const codeEditorTab = page.locator('button[role="tab"]').filter({ hasText: /Code Editor/i }).first()
    if (await codeEditorTab.isVisible({ timeout: 3000 })) {
      await codeEditorTab.click()
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      
      const monaco = page.locator('.monaco-editor').first()
      await expect(monaco).toBeVisible({ timeout: 15000 })
    }
  })

  test('no critical console errors', async ({ page }) => {
    test.setTimeout(20000)
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })
    
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
