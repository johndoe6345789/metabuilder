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

  await page.goto('/', { waitUntil: 'networkidle', timeout: 15000 })

  // Wait a bit
  await page.waitForTimeout(2000)

  // Get page content
  const rootHTML = await page.locator('#root').innerHTML().catch(() => 'ERROR GETTING ROOT')

  console.log('=== PAGE ERRORS ===')
  pageErrors.forEach(err => console.log(err.message))

  console.log('\n=== CONSOLE ERRORS ===')
  errors.forEach(err => console.log(err))

  console.log('\n=== ROOT CONTENT ===')
  console.log(rootHTML.substring(0, 500))

  console.log('\n=== ROOT VISIBLE ===')
  const rootVisible = await page.locator('#root').isVisible().catch(() => false)
  console.log('Root visible:', rootVisible)

  console.log('\n=== ROOT HAS CHILDREN ===')
  const childCount = await page.locator('#root > *').count()
  console.log('Child count:', childCount)
})
