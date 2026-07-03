import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    // No auth needed — landing page is public
    await page.route('**/api/auth/session',
      r => r.fulfill({ status: 401, body: '{}' }),
    )
    await page.route('**/core/page_config**',
      r => r.fulfill({ status: 503, body: '{}' }),
    )
  })

  test('hero section renders', async ({ page }) => {
    await page.goto('/app')
    await expect(page.getByText('Your community.')).toBeVisible()
    await expect(page.getByText('Your platform.')).toBeVisible()
    await expect(page.getByText('Start free trial').first()).toBeVisible()
    await expect(page.getByText('No credit card required')).toBeVisible()
  })

  test('all 6 packages shown', async ({ page }) => {
    await page.goto('/app')
    for (const name of ['Pages', 'Community', 'Members', 'Content', 'Email', 'Analytics']) {
      await expect(page.getByRole('heading', { name, level: 3 })).toBeVisible()
    }
  })

  test('three pricing tiers shown', async ({ page }) => {
    await page.goto('/app')
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Creator')).toBeVisible()
    await expect(page.getByText('Studio')).toBeVisible()
    await expect(page.getByText('£29')).toBeVisible()
    await expect(page.getByText('£59')).toBeVisible()
    await expect(page.getByText('£129')).toBeVisible()
  })

  test('"Most popular" badge on Creator tier', async ({ page }) => {
    await page.goto('/app')
    await expect(page.getByText('Most popular')).toBeVisible()
  })

  test('nav Sign In and Start free links present', async ({ page }) => {
    await page.goto('/app')
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Start free', exact: true }),
    ).toBeVisible()
  })
})

test.describe('Signup page', () => {
  test('renders all fields and 3 plan cards', async ({ page }) => {
    await page.goto('/app/ui/signup')
    await expect(page.getByText('Create your community')).toBeVisible()
    await expect(page.getByPlaceholder('Acme Running Club')).toBeVisible()
    await expect(page.getByPlaceholder('Alex Smith')).toBeVisible()
    await expect(page.getByPlaceholder('alex@example.com')).toBeVisible()

    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Creator')).toBeVisible()
    await expect(page.getByText('Studio')).toBeVisible()
  })

  test('URL slug preview appears when typing community name', async ({ page }) => {
    await page.goto('/app/ui/signup')
    await page.getByPlaceholder('Acme Running Club').fill('Acme Running Club')
    await expect(
      page.getByText(/metabuilder\.app\/acme-running-club/),
    ).toBeVisible()
  })

  test('selecting a plan highlights it', async ({ page }) => {
    await page.goto('/app/ui/signup')
    // Creator is default (highlight)
    const starter = page.getByRole('button', { name: /Starter/ })
    await starter.click()
    // After click, Starter should be selected (border)
    const cls = await starter.getAttribute('class')
    expect(cls).toContain('tierSelected')
  })

  test('submit disabled with empty fields', async ({ page }) => {
    await page.goto('/app/ui/signup')
    await expect(
      page.getByRole('button', { name: 'Start free trial' }),
    ).toBeDisabled()
  })
})
