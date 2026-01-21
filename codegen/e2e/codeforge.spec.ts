import { test, expect } from '@playwright/test'

test.describe('CodeForge - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(20000)
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })
  })

  test('should load the application successfully', async ({ page }) => {
    // Check root has children (content rendered)
    await page.waitForSelector('#root > *', { timeout: 10000 })
    const root = page.locator('#root')
    await expect(root).toHaveCount(1)
  })

  test('should display main navigation', async ({ page }) => {
    const tabList = page.locator('[role="tablist"]').first()
    await expect(tabList).toBeVisible({ timeout: 5000 })
  })

  test('should switch between tabs', async ({ page }) => {
    const tabs = page.locator('button[role="tab"]')
    const tabCount = await tabs.count()
    
    if (tabCount > 1) {
      await tabs.nth(1).click()
      await expect(page.locator('[role="tabpanel"]:visible')).toBeVisible({ timeout: 3000 })
    }
  })
})

test.describe('CodeForge - Code Editor', () => {
  test('should display Monaco editor', async ({ page }) => {
    test.setTimeout(30000)
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })
    
    const codeEditorTab = page.locator('button[role="tab"]').filter({ hasText: /Code Editor/i }).first()
    if (await codeEditorTab.isVisible({ timeout: 3000 })) {
      await codeEditorTab.click()
      await page.waitForLoadState('networkidle', { timeout: 10000 })
      
      const monacoEditor = page.locator('.monaco-editor').first()
      await expect(monacoEditor).toBeVisible({ timeout: 15000 })
    }
  })
})

test.describe('CodeForge - Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    test.setTimeout(20000)
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    await page.waitForSelector('#root > *', { timeout: 10000 })
  })

  test('should work on tablet viewport', async ({ page }) => {
    test.setTimeout(20000)
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 })
    await page.waitForLoadState('networkidle', { timeout: 5000 })

    await page.waitForSelector('#root > *', { timeout: 10000 })
  })
})
