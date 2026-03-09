import { test, expect } from '@playwright/test'

/**
 * Deployment smoke tests — validates all services are reachable
 * through the nginx gateway on port 80.
 */

const GATEWAY = 'http://localhost'

test.describe('Deployment Smoke Tests', () => {
  test.describe('Web Applications', () => {
    const apps = [
      { path: '/workflowui', name: 'WorkflowUI' },
      { path: '/codegen', name: 'CodeForge' },
      { path: '/pastebin', name: 'Pastebin' },
      { path: '/emailclient', name: 'Email Client' },
      { path: '/diagrams', name: 'Exploded Diagrams' },
      { path: '/storybook/', name: 'Storybook' },
      { path: '/app', name: 'Frontend App' },
    ]

    for (const { path, name } of apps) {
      test(`${name} loads via gateway (${path})`, async ({ page }) => {
        const response = await page.goto(`${GATEWAY}${path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        })
        expect(response?.status()).toBeLessThan(500)
        const body = page.locator('body')
        await expect(body).not.toBeEmpty()
      })
    }

    test('Postgres Dashboard redirects correctly', async ({ page }) => {
      const response = await page.goto(`${GATEWAY}/postgres`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      })
      // 307/308 redirects are followed automatically by playwright
      expect(response?.status()).toBeLessThan(500)
    })
  })

  test.describe('API Services', () => {
    test('DBAL health endpoint responds', async ({ request }) => {
      const resp = await request.get(`${GATEWAY}/api/health`)
      expect(resp.ok()).toBeTruthy()
    })

    test('DBAL version endpoint responds', async ({ request }) => {
      const resp = await request.get(`${GATEWAY}/api/version`)
      expect(resp.ok()).toBeTruthy()
    })
  })

  test.describe('Portal', () => {
    test('Portal index page loads', async ({ page }) => {
      const response = await page.goto(GATEWAY, {
        waitUntil: 'domcontentloaded',
      })
      expect(response?.status()).toBe(200)
      await expect(page.locator('body')).toContainText('MetaBuilder')
    })
  })

  test.describe('Admin Tools (direct ports)', () => {
    test('phpMyAdmin responds', async ({ request }) => {
      const resp = await request.get('http://localhost:8081')
      expect(resp.status()).toBeLessThan(500)
    })

    test('Mongo Express responds', async ({ request }) => {
      const resp = await request.get('http://localhost:8082')
      expect(resp.status()).toBeLessThan(500)
    })

    test('RedisInsight responds', async ({ request }) => {
      const resp = await request.get('http://localhost:8083')
      expect(resp.status()).toBeLessThan(500)
    })
  })
})
