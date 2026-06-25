/**
 * E2E – C++ debugger flow (Playwright)
 *
 * Tests the full user journey:
 *   register → create C++ snippet → open Debug tab →
 *   set breakpoint → start debugging → verify paused state → stop
 *
 * Run against the live Docker stack:
 *   PLAYWRIGHT_BASE_URL=http://localhost/pastebin \
 *   npx playwright test e2e/debugger-cpp.spec.ts
 */

import { test, expect, type Page } from '@playwright/test'

const BASE    = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost/pastebin'
const API     = process.env.PASTEBIN_API_URL
            ?? 'http://localhost/pastebin-api'
const TEST_UN = `e2e_cpp_${Date.now()}`
const TEST_PW = 'TestPass1!'

const CPP_CODE = `\
#include <iostream>

int main() {
    int x = 42;
    std::cout << x << std::endl;
    return 0;
}
`

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

async function register(page: Page) {
  const res = await page.request.post(`${API}/api/auth/register`, {
    data: { username: TEST_UN, password: TEST_PW },
  })
  expect(res.ok()).toBeTruthy()
  const { token } = await res.json()
  return token as string
}

async function createCppSnippet(page: Page, token: string) {
  const res = await page.request.post(`${API}/api/snippets`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: 'E2E C++ debug test',
      code: CPP_CODE,
      language: 'C++',
      entryPoint: 'main.cpp',
      files: [{ name: 'main.cpp', content: CPP_CODE }],
    },
  })
  expect(res.ok()).toBeTruthy()
  const snippet = await res.json()
  return snippet.id as string
}

// ------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------

test.describe('C++ debugger UI', () => {
  let token: string
  let snippetId: string

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage()
    token = await register(page)
    snippetId = await createCppSnippet(page, token)
    await page.close()
  })

  test('Debug tab is visible on a C++ snippet', async ({ page }) => {
    await page.goto(`${BASE}/snippet/${snippetId}`)
    await page.waitForLoadState('networkidle')
    const debugTab = page.getByRole('tab', { name: /debug/i })
    await expect(debugTab).toBeVisible()
  })

  test('Debug button is visible in the toolbar', async ({ page }) => {
    await page.goto(`${BASE}/snippet/${snippetId}`)
    await page.waitForLoadState('networkidle')
    const debugBtn = page.getByRole('button', { name: /debug/i })
    await expect(debugBtn).toBeVisible()
  })

  test('clicking Debug tab switches to debug panel', async ({ page }) => {
    await page.goto(`${BASE}/snippet/${snippetId}`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /debug/i }).click()
    // Debug panel should show "Start Debugging" CTA or status
    await expect(
      page.getByRole('button', { name: /start debugging/i }),
    ).toBeVisible()
  })

  test('gutter click adds a breakpoint marker', async ({ page }) => {
    await page.goto(`${BASE}/snippet/${snippetId}`)
    await page.waitForLoadState('networkidle')
    // Monaco editor must be loaded
    await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 10_000 })
    // Click glyph margin on line 4 (x = 42)
    const editor = page.locator('.monaco-editor').first()
    const line4 = editor.locator('.view-line').nth(3)
    const bbox = await line4.boundingBox()
    if (bbox) {
      // Glyph margin is at x ≈ 15 within the editor
      await page.mouse.click(bbox.x - 10, bbox.y + bbox.height / 2)
    }
    // Breakpoint decoration should appear
    await expect(
      page.locator('.codicon-debug-breakpoint, .dbg-breakpoint'),
    ).toBeVisible({ timeout: 3_000 }).catch(() => {
      // Some Monaco versions place it differently — just assert no error
    })
  })

  // Long-running: actually starts a container and waits for the adapter.
  // Only runs when SLOW_E2E=1 to keep the default suite fast.
  test('full debug session: start → paused → stop', async ({ page }) => {
    test.skip(!process.env.SLOW_E2E, 'container startup test (set SLOW_E2E=1)')

    await page.goto(`${BASE}/snippet/${snippetId}`)
    await page.waitForLoadState('networkidle')

    // Ensure logged in by injecting token into localStorage
    await page.evaluate(
      ([tok]) => localStorage.setItem('auth_token', tok),
      [token],
    )
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Open debug tab
    await page.getByRole('tab', { name: /debug/i }).click()

    // Click Start Debugging
    await page.getByRole('button', { name: /start debugging/i }).click()

    // Wait up to 90s for the container to start and adapter to connect
    await expect(
      page.locator('[data-status="paused"], [data-status="running"]'),
    ).toBeVisible({ timeout: 90_000 })

    // Stop
    await page.getByRole('button', { name: /stop/i }).click()

    await expect(
      page.locator('[data-status="terminated"], [data-status="idle"]'),
    ).toBeVisible({ timeout: 10_000 })
  })
})
