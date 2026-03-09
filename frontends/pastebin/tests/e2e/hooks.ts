/**
 * Named hook registry for the JSON-driven Playwright test framework.
 *
 * Hooks replace inline `evaluate` / `custom` assertions with properly-typed,
 * named functions that JSON tests reference by name only — no code strings
 * in JSON files.
 *
 * Two categories:
 *   - SetupHook  — side effects only (action: "hook")
 *   - EvalHook   — returns a value for assertions or variable storage
 *                   (action: "evalExpect" / "store")
 *
 * To add a new hook:
 *   1. Write the function below in the appropriate section.
 *   2. Add it to the `setupHooks` or `evalHooks` record.
 *   3. Add it to `playwright.schema.json` hookName enum.
 */

import type { Page, ConsoleMessage, Response } from '@playwright/test'

// ─── Public types ─────────────────────────────────────────────────────────────

/** Mutable per-test variable store, shared between interpreter and hooks. */
export type Vars = Map<string, unknown>

/** A hook that performs side effects and returns nothing. */
export type SetupHook = (
  page: Page,
  args: Record<string, unknown>,
  vars: Vars,
) => Promise<void>

/** A hook that computes and returns a value (for evalExpect / store). */
export type EvalHook<T = unknown> = (
  page: Page,
  args: Record<string, unknown>,
  vars: Vars,
) => Promise<T>

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

// ─── Setup hooks ──────────────────────────────────────────────────────────────

export const setupHooks: Record<string, SetupHook> = {
  /**
   * Log in by calling the Flask API and writing the JWT token directly to
   * IndexedDB (redux-persist format). Bypasses the login form entirely —
   * much faster under parallel load since no JS bundle download is required.
   *
   * args: { username?: string, password?: string }
   * Defaults to the playwright test user (playwright / pw-test-2024).
   */
  loginViaApi: async (page, args) => {
    const username = (args.username as string | undefined) ?? 'playwright'
    const password = (args.password as string | undefined) ?? 'pw-test-2024'

    const response = await page.request.post('/pastebin-api/api/auth/login', {
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!response.ok()) {
      throw new Error(`loginViaApi: login failed with ${response.status()}`)
    }
    const { token, user } = (await response.json()) as { token: string; user: Record<string, unknown> }

    // IndexedDB requires a page with the target origin to be loaded.
    // Navigate to the app root so we're in the right security context.
    if (!page.url().includes('/pastebin')) {
      await page.goto('', { waitUntil: 'domcontentloaded' })
    }

    // Write auth state into IndexedDB so redux-persist rehydrates on next page load.
    // DB: metabuilder-persist  |  Store: redux-state  |  Key: persist:pastebin
    await page.evaluate(
      ({ token, user }) => {
        return new Promise<void>((resolve, reject) => {
          const req = indexedDB.open('metabuilder-persist', 1)
          req.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains('redux-state')) {
              db.createObjectStore('redux-state')
            }
          }
          req.onsuccess = (e) => {
            const db = (e.target as IDBOpenDBRequest).result
            const tx = db.transaction('redux-state', 'readwrite')
            const store = tx.objectStore('redux-state')
            const value = JSON.stringify({
              auth: JSON.stringify({ token, user, isAuthenticated: true, loading: false, error: null }),
              _persist: JSON.stringify({ version: 1, rehydrated: true }),
            })
            store.put(value, 'persist:pastebin')
            tx.oncomplete = () => resolve()
            tx.onerror = () => reject(tx.error)
          }
          req.onerror = () => reject(req.error)
        })
      },
      { token, user },
    )
  },

  /**
   * Create a snippet via the DBAL API and navigate to its view page.
   * Requires loginViaApi to have been called first (token in IndexedDB).
   * Stores the snippet ID in vars as 'snippetId'.
   */
  createAndViewSnippet: async (page, args, vars) => {
    // First ensure auth state is in IndexedDB (so the page renders authenticated)
    await setupHooks.loginViaApi(page, args, vars)

    // Get auth token from the login response for API calls
    const username = (args.username as string | undefined) ?? 'playwright'
    const password = (args.password as string | undefined) ?? 'pw-test-2024'

    const loginResp = await page.request.post('/pastebin-api/api/auth/login', {
      data: { username, password },
      headers: { 'Content-Type': 'application/json' },
    })
    if (!loginResp.ok()) throw new Error('createAndViewSnippet: login failed')
    const { token } = (await loginResp.json()) as { token: string }

    // Get namespaces to find one to use
    const nsResp = await page.request.get('/api/dbal/pastebin/pastebin/Namespace', {
      headers: { Authorization: `Bearer ${token}` },
    })
    const nsData = (await nsResp.json()) as { data: { data: Array<{ id: string; name: string }> } }
    let namespaceId = nsData.data?.data?.[0]?.id

    // Create a namespace only if none exist
    if (!namespaceId) {
      const createResp = await page.request.post('/api/dbal/pastebin/pastebin/Namespace', {
        data: { name: 'E2E Comments', isDefault: false, tenantId: 'pastebin' },
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      if (createResp.ok()) {
        const created = (await createResp.json()) as { data: { id: string } }
        namespaceId = created.data?.id
      }
    }
    if (!namespaceId) throw new Error('createAndViewSnippet: no namespace found')

    // Create a snippet
    const snippetResp = await page.request.post('/api/dbal/pastebin/pastebin/Snippet', {
      data: {
        title: 'E2E Comment Test Snippet',
        language: 'python',
        category: 'test',
        description: 'Created by E2E test for comment testing',
        code: 'print("hello")\n',
        namespaceId,
        tenantId: 'pastebin',
        hasPreview: false,
        isTemplate: false,
        inputParameters: '[]',
      },
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!snippetResp.ok()) {
      const body = await snippetResp.text()
      throw new Error(`createAndViewSnippet: snippet creation failed (${snippetResp.status()}): ${body}`)
    }
    const snippetData = (await snippetResp.json()) as { data: { id: string }; id?: string }
    const snippetId = snippetData.data?.id ?? snippetData.id
    if (!snippetId) throw new Error('createAndViewSnippet: no snippet ID returned')
    vars.set('snippetId', snippetId)

    // Navigate to home page to load snippets into Redux store
    await page.goto('', { waitUntil: 'domcontentloaded' })
    // Wait for snippet cards to appear (the snippet we just created should be listed)
    await page.waitForSelector('[data-testid="snippet-card-view-btn"]', { timeout: 15000 })
    // Click the first snippet view button
    await page.locator('[data-testid="snippet-card-view-btn"]').first().click()
    // Wait for the snippet view page to render
    await page.waitForSelector('[data-testid="snippet-view-page"]', { timeout: 15000 })
  },

  /**
   * Clear localStorage and sessionStorage.
   * Use before tests that need a clean auth/preferences state.
   */
  clearStorage: async (page) => {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
  },

  /**
   * Fully clear auth state: delete the metabuilder-persist IndexedDB, clear
   * storage, then navigate to the login page. Use before login/register tests
   * that need an unauthenticated session.
   */
  clearAuth: async (page) => {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase('metabuilder-persist')
          req.onsuccess = () => resolve()
          req.onerror = () => resolve()
          req.onblocked = () => resolve()
        }),
    )
    // Navigate to login — this forces a fresh page load without cached Redux state
    await page.goto('login', { waitUntil: 'domcontentloaded' })
  },

  /**
   * Delete the 'pastebin' IndexedDB database.
   * Use before tests that need a clean snippet/namespace state.
   */
  clearIndexedDB: async (page) => {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const req = indexedDB.deleteDatabase('pastebin')
          req.onsuccess = () => resolve()
          req.onerror = () => resolve()
          req.onblocked = () => resolve()
        }),
    )
  },

  /**
   * Begin collecting console errors for this test.
   * Call assertNoConsoleErrors at the end to fail if any were captured.
   * Errors matching common noise patterns (IndexedDB, network, 404) are ignored.
   */
  trackConsoleErrors: async (page, _args, vars) => {
    const IGNORE = [/indexeddb/i, /constrainterror/i, /failed to load/i, /network/i, /404/i]
    const errors: string[] = []

    const handler = (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        const text = msg.text()
        if (!IGNORE.some((r) => r.test(text))) errors.push(text)
      }
    }

    page.on('console', handler)
    vars.set('__consoleErrors', errors)
    vars.set('__consoleErrorsCleanup', () => page.off('console', handler))
  },

  /**
   * Assert that no critical console errors were collected since trackConsoleErrors.
   * Also removes the console listener.
   */
  assertNoConsoleErrors: async (_page, _args, vars) => {
    const cleanup = vars.get('__consoleErrorsCleanup') as (() => void) | undefined
    cleanup?.()
    const errors = (vars.get('__consoleErrors') as string[]) ?? []
    if (errors.length > 0) {
      throw new Error(`Console errors detected:\n${errors.join('\n')}`)
    }
  },

  /**
   * Begin monitoring HTTP responses for error status codes.
   * Call assertNoNetworkErrors at the end to fail if any were captured.
   * 304 Not Modified is excluded.
   */
  watchNetworkErrors: async (page, _args, vars) => {
    const errors: string[] = []

    const handler = (response: Response) => {
      // Only flag 5xx server errors — 4xx (401, 404) are expected on initial
      // unauthenticated load and should not count as test failures.
      if (response.status() >= 500) {
        errors.push(`${response.status()} ${response.url()}`)
      }
    }

    page.on('response', handler)
    vars.set('__networkErrors', errors)
    vars.set('__networkErrorsCleanup', () => page.off('response', handler))
  },

  /** Assert that no network errors were recorded since watchNetworkErrors. */
  assertNoNetworkErrors: async (_page, _args, vars) => {
    const cleanup = vars.get('__networkErrorsCleanup') as (() => void) | undefined
    cleanup?.()
    const errors = (vars.get('__networkErrors') as string[]) ?? []
    if (errors.length > 0) {
      throw new Error(`Network errors detected:\n${errors.join('\n')}`)
    }
  },
}

// ─── Eval hooks ───────────────────────────────────────────────────────────────

export const evalHooks: Record<string, EvalHook> = {
  /**
   * Return the computed CSS value of a property on the first matching element.
   * args: { selector: string, property: string }
   * Returns: string | null
   */
  getComputedStyle: async (page, args) => {
    const { selector, property } = args as { selector: string; property: string }
    return page.evaluate(
      ([sel, prop]) => {
        const el = document.querySelector(sel)
        return el ? window.getComputedStyle(el).getPropertyValue(prop).trim() : null
      },
      [selector, property] as [string, string],
    )
  },

  /**
   * Return scroll dimensions of an element (defaults to body).
   * args: { selector?: string }
   * Returns: { scrollWidth, clientWidth, scrollHeight, clientHeight, hasHorizontalScroll, hasVerticalScroll }
   */
  getScrollInfo: async (page, args) => {
    const sel = (args.selector as string | undefined) ?? 'body'
    return page.evaluate((s) => {
      const el = document.querySelector(s) ?? document.body
      return {
        scrollWidth: el.scrollWidth,
        clientWidth: el.clientWidth,
        scrollHeight: el.scrollHeight,
        clientHeight: el.clientHeight,
        hasHorizontalScroll: el.scrollWidth > el.clientWidth,
        hasVerticalScroll: el.scrollHeight > el.clientHeight,
      }
    }, sel)
  },

  /**
   * Return the bounding box of the first matching element.
   * args: { testId?: string, selector?: string }
   * Returns: BoundingBox | null
   */
  getBoundingBox: async (page, args) => {
    const { testId, selector } = args as { testId?: string; selector?: string }
    const loc = testId ? page.getByTestId(testId) : page.locator(selector!)
    return loc.boundingBox()
  },

  /**
   * Check that no two elements in the selector set overlap each other.
   * args: { selector: string }
   * Returns: boolean (true = no overlaps)
   */
  checkNoOverlap: async (page, args) => {
    const { selector } = args as { selector: string }
    const items = page.locator(selector)
    const count = await items.count()
    const boxes: BoundingBox[] = []
    for (let i = 0; i < count; i++) {
      const b = await items.nth(i).boundingBox()
      if (b) boxes.push(b)
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        if (
          a.x < b.x + b.width &&
          a.x + a.width > b.x &&
          a.y < b.y + b.height &&
          a.y + a.height > b.y
        ) {
          return false
        }
      }
    }
    return true
  },

  /**
   * Return a list of elements that are smaller than the minimum touch target size.
   * args: { selector: string, minSize?: number }  — minSize defaults to 44px
   * Returns: string[] of violation descriptions (empty = all pass)
   */
  getTouchTargetViolations: async (page, args) => {
    const { selector, minSize = 44 } = args as { selector: string; minSize?: number }
    const items = page.locator(selector)
    const count = await items.count()
    const violations: string[] = []
    for (let i = 0; i < count; i++) {
      const box = await items.nth(i).boundingBox()
      if (box && (box.width < minSize || box.height < minSize)) {
        violations.push(`[${i}] ${Math.round(box.width)}×${Math.round(box.height)}px (min ${minSize}px)`)
      }
    }
    return violations
  },

  /**
   * Test whether an element's text content matches a regex pattern.
   * args: { testId?: string, selector?: string, pattern: string }
   * Returns: boolean
   */
  matchesPattern: async (page, args) => {
    const { testId, selector, pattern } = args as {
      testId?: string
      selector?: string
      pattern: string
    }
    const loc = testId ? page.getByTestId(testId) : page.locator(selector!)
    const text = (await loc.textContent()) ?? ''
    return new RegExp(pattern).test(text)
  },

  /**
   * Return whether the page (or an element) has a horizontal scrollbar.
   * args: { selector?: string }  — defaults to body
   * Returns: boolean
   */
  hasHorizontalScroll: async (page, args) => {
    const sel = (args.selector as string | undefined) ?? null
    return page.evaluate((s) => {
      const el = s ? document.querySelector(s) : document.body
      return el ? el.scrollWidth > el.clientWidth : false
    }, sel)
  },

  /**
   * Return the text content of an element.
   * args: { testId?: string, selector?: string }
   * Returns: string | null
   */
  getElementText: async (page, args) => {
    const { testId, selector } = args as { testId?: string; selector?: string }
    const loc = testId ? page.getByTestId(testId) : page.locator(selector!)
    return loc.textContent()
  },

  /**
   * Return the number of elements matching the locator.
   * args: { testId?: string, selector?: string }
   * Returns: number
   */
  getElementCount: async (page, args) => {
    const { testId, selector } = args as { testId?: string; selector?: string }
    const loc = testId ? page.getByTestId(testId) : page.locator(selector!)
    return loc.count()
  },
}
