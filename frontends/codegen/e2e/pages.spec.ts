import { test, expect } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

interface PageConfig {
  id: string
  title: string
  enabled: boolean
  isRoot?: boolean
  type?: string
  component?: string
  schemaPath?: string
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const pagesPath = resolve(__dirname, '../src/config/pages.json')
const pagesConfig: { pages: PageConfig[] } = JSON.parse(readFileSync(pagesPath, 'utf-8'))
const enabledPages = pagesConfig.pages.filter((p) => p.enabled)

function getPageUrl(page: PageConfig): string {
  return page.isRoot ? '/codegen' : `/codegen/${page.id}`
}

interface PageDebugInfo {
  url: string
  mainContentHTML: string
  mainContentChildCount: number
  deepElementCount: number
  textLength: string
  consoleErrors: string[]
  pageErrors: string[]
  hasCanvas: boolean
  hasSvg: boolean
  hasInputs: boolean
}

async function collectDebugInfo(
  page: import('@playwright/test').Page,
  url: string,
  consoleErrors: string[],
  pageErrors: string[]
): Promise<PageDebugInfo> {
  const mainContent = page.locator('[data-testid="main-content"]')
  const exists = await mainContent.count() > 0

  if (!exists) {
    return {
      url,
      mainContentHTML: '<main-content NOT FOUND>',
      mainContentChildCount: 0,
      deepElementCount: 0,
      textLength: '0',
      consoleErrors,
      pageErrors,
      hasCanvas: false,
      hasSvg: false,
      hasInputs: false,
    }
  }

  const info = await mainContent.evaluate((el) => ({
    html: el.innerHTML.substring(0, 2000),
    childCount: el.children.length,
    deepCount: el.querySelectorAll('*').length,
    text: (el.innerText || '').trim().substring(0, 500),
    hasCanvas: !!el.querySelector('canvas'),
    hasSvg: !!el.querySelector('svg'),
    hasInputs: !!el.querySelector('input, textarea, select, button'),
  }))

  return {
    url,
    mainContentHTML: info.html,
    mainContentChildCount: info.childCount,
    deepElementCount: info.deepCount,
    textLength: `${info.text.length} chars: "${info.text.substring(0, 200)}"`,
    consoleErrors,
    pageErrors,
    hasCanvas: info.hasCanvas,
    hasSvg: info.hasSvg,
    hasInputs: info.hasInputs,
  }
}

test.describe('CodeForge - All Pages Render', () => {
  for (const pageConfig of enabledPages) {
    test(`"${pageConfig.title}" (/${pageConfig.id}) renders without crash`, async ({ page }) => {
      test.setTimeout(45000)

      const pageErrors: string[] = []
      const consoleErrors: string[] = []
      page.on('pageerror', (err) => pageErrors.push(err.message))
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text())
      })

      const url = getPageUrl(pageConfig)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })

      const layout = page.locator('[data-testid="app-layout"]')
      await expect(layout).toBeVisible({ timeout: 15000 })

      const mainContent = page.locator('[data-testid="main-content"]')
      await expect(mainContent).toBeVisible({ timeout: 10000 })

      // Wait for async page content to render
      await page.waitForTimeout(2000)

      // Collect content metrics
      const contentInfo = await mainContent.evaluate((el) => {
        const deepElements = el.querySelectorAll('*')
        const textLength = (el.innerText || '').trim().length
        return {
          childCount: el.children.length,
          deepElementCount: deepElements.length,
          textLength,
          hasCanvas: !!el.querySelector('canvas'),
          hasSvg: !!el.querySelector('svg'),
          hasInputs: !!el.querySelector('input, textarea, select, button'),
        }
      })

      // Fail if page is blank
      const isNotBlank =
        contentInfo.deepElementCount > 2 ||
        contentInfo.textLength > 0 ||
        contentInfo.hasCanvas ||
        contentInfo.hasSvg ||
        contentInfo.hasInputs

      if (!isNotBlank) {
        const debug = await collectDebugInfo(page, url, consoleErrors, pageErrors)
        test.info().annotations.push({ type: 'debug', description: JSON.stringify(debug, null, 2) })
        expect(
          false,
          `Page "${pageConfig.title}" is blank.\n` +
          `  URL: ${url}\n` +
          `  Children: ${contentInfo.childCount}, Deep elements: ${contentInfo.deepElementCount}\n` +
          `  Text: ${contentInfo.textLength} chars\n` +
          `  Console errors: ${consoleErrors.length}\n` +
          `  Page errors: ${pageErrors.join('; ') || 'none'}\n` +
          `  HTML: ${debug.mainContentHTML.substring(0, 500)}`
        ).toBe(true)
      }

      // Fail on stack overflow crashes
      const crashErrors = pageErrors.filter(
        (e) =>
          e.includes('Maximum call stack') ||
          e.includes('too much recursion') ||
          e.includes('stack overflow')
      )
      expect(crashErrors).toHaveLength(0)
    })
  }
})

test.describe('CodeForge - Sidebar Navigation to Every Page', () => {
  test('can navigate to each page via sidebar links', async ({ page }) => {
    test.setTimeout(enabledPages.length * 8000)

    await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 20000 })
    await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })

    const navLinks = page.locator('[data-testid^="nav-link-"]')
    const linkCount = await navLinks.count()

    expect(linkCount).toBeGreaterThan(0)

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i)
      const testId = await link.getAttribute('data-testid')
      if (!testId) continue

      await link.scrollIntoViewIfNeeded()
      await link.click({ force: true })
      await page.waitForTimeout(500)

      const mainContent = page.locator('[data-testid="main-content"]')
      await expect(mainContent).toBeVisible({ timeout: 5000 })
    }
  })
})

test.describe('CodeForge - No Fatal Errors Per Page', () => {
  for (const pageConfig of enabledPages) {
    test(`"${pageConfig.title}" (/${pageConfig.id}) has no fatal errors`, async ({ page }) => {
      test.setTimeout(45000)

      const fatalErrors: string[] = []
      page.on('pageerror', (err) => fatalErrors.push(err.message))

      const url = getPageUrl(pageConfig)
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 })
      await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 15000 })
      await page.waitForTimeout(1000)

      const crashErrors = fatalErrors.filter(
        (e) =>
          e.includes('Maximum call stack') ||
          e.includes('too much recursion') ||
          e.includes('stack overflow') ||
          e.includes('out of memory')
      )
      expect(crashErrors).toHaveLength(0)
    })
  }
})
