import { test } from '@playwright/test'

test('screenshot pastebin pages', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 })

  await page.goto('http://localhost/pastebin', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: '/tmp/pastebin-home.png', fullPage: true })

  await page.goto('http://localhost/pastebin/new', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/pastebin-new.png', fullPage: true })

  await page.goto('http://localhost/pastebin/explore', { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {})
  await page.waitForTimeout(1000)
  await page.screenshot({ path: '/tmp/pastebin-explore.png', fullPage: true })
})
