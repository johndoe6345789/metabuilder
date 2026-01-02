import { expect, test } from '@playwright/test'

test.describe('DBAL Daemon', () => {
  test('shows the daemon hero, highlights, and status feed', async ({ page }) => {
    await page.goto('/dbal-daemon')

    await expect(page.getByRole('heading', { name: /C\+\+ Daemon/i })).toBeVisible()
    await expect(page.getByText(/Sandboxed gRPC Gateway/i)).toBeVisible()
    await expect(page.getByText(/Query Executor/i)).toBeVisible()
    await expect(page.getByText(/Adapter Layer/i)).toBeVisible()
    await expect(page.getByRole('heading', { name: /Server Status/i })).toBeVisible()

    // Wait for at least one status card to load
    await expect(page.getByText(/DBAL TypeScript Client/i)).toBeVisible()
    await expect(page.getByText(/Observability Feed/i)).toBeVisible()
  })
})
