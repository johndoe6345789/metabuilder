import { test } from '@playwright/test'

test('debug page load', async ({ page }) => {
  const errors: string[] = []
  const pageErrors: Error[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  page.on('pageerror', (error) => {
    pageErrors.push(error)
  })

  await page.goto('/codegen', { waitUntil: 'domcontentloaded', timeout: 15000 })

  // Wait for the app layout to render
  await page.locator('[data-testid="app-layout"]').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {})

  // Get page content using data-testid
  const layoutHTML = await page.locator('[data-testid="app-layout"]').innerHTML().catch(() => 'LAYOUT NOT FOUND')

  console.log('=== PAGE ERRORS ===')
  pageErrors.forEach(err => console.log(err.message))

  console.log('\n=== CONSOLE ERRORS ===')
  errors.forEach(err => console.log(err))

  console.log('\n=== LAYOUT CONTENT ===')
  console.log(layoutHTML.substring(0, 500))

  console.log('\n=== LAYOUT VISIBLE ===')
  const layoutVisible = await page.locator('[data-testid="app-layout"]').isVisible().catch(() => false)
  console.log('Layout visible:', layoutVisible)

  console.log('\n=== HEADER VISIBLE ===')
  const headerVisible = await page.locator('[data-testid="app-header"]').isVisible().catch(() => false)
  console.log('Header visible:', headerVisible)
})
