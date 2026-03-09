import { test } from '@playwright/test'

const GATEWAY = 'http://localhost'

test('debug errors page', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto(`${GATEWAY}/codegen/persistence`, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: '/tmp/errors-page.png' })

  const main = await page.evaluate(() => document.querySelector('main')?.innerHTML ?? 'NO MAIN')
  console.log('MAIN:', main.substring(0, 3000))
  console.log('ERRORS:', errors.join('\n'))
})
