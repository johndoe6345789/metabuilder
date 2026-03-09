/**
 * JSON-driven Playwright test runner for the pastebin frontend.
 *
 * Discovers every *.json file in this directory (except md3-schema.json and
 * node_modules / tsconfig artefacts) and runs the tests defined in each file
 * as a separate describe block. No TypeScript test logic lives in the JSON
 * files — complex operations are referenced by hook name and executed here.
 *
 * New action types (in addition to the original set):
 *   hook        — call a named SetupHook (side effects, no return value)
 *   evalExpect  — call a named EvalHook and assert the result
 *   store       — call a named EvalHook and save the result to a test-scoped variable
 *   tap         — touch-tap an element (mobile tests)
 *   setViewport — change the browser viewport size
 *
 * Hook registry: tests/e2e/hooks.ts
 * Schema:        schemas/package-schemas/playwright.schema.json
 */

import { test, expect, Page, Locator, APIRequestContext } from '@playwright/test'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname, basename } from 'path'
import { fileURLToPath } from 'url'
import { setupHooks, evalHooks, type Vars } from './hooks'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Types ────────────────────────────────────────────────────────────────────

interface SkipIf {
  selector: string
  state: 'hidden' | 'visible' | 'enabled' | 'disabled'
}

interface Assertion {
  matcher: string
  not?: boolean
  expected?: unknown
  text?: string
  value?: unknown
  name?: string
  property?: string
  className?: unknown
  count?: number
  url?: string
  title?: string
  pattern?: string
  script?: string
  timeout?: number
}

interface TestStep {
  action: string
  description?: string
  skipIf?: SkipIf
  // Hook / eval fields
  name?: string
  args?: Record<string, unknown>
  as?: string
  // Locator fields
  testId?: string
  role?: string
  text?: string
  label?: string
  placeholder?: string
  alt?: string
  title?: string
  selector?: string
  nth?: number
  // Action-specific fields
  url?: string
  urlPattern?: string
  waitUntil?: string
  state?: string
  value?: string
  key?: string
  keys?: string | string[]
  timeout?: number
  filename?: string
  fullPage?: boolean
  clipFrom?: string
  width?: number
  height?: number
  method?: string
  body?: unknown
  x?: number
  y?: number
  delay?: number
  script?: string
  assertion?: Assertion
}

interface ParameterizeConfig {
  data: Record<string, string>[]
}

interface TestCase {
  name: string
  description?: string
  skip?: boolean
  only?: boolean
  timeout?: number
  tags?: string[]
  parameterize?: ParameterizeConfig
  beforeEach?: TestStep[]
  afterEach?: TestStep[]
  steps: TestStep[]
}

interface TestFile {
  suite?: string
  description?: string
  package?: string
  tests: TestCase[]
}

// ─── Variable interpolation ───────────────────────────────────────────────────

function interpolateStr(value: string, data: Record<string, string>): string {
  return value.replace(/\$\{(\w+)\}/g, (_, key) => (key in data ? data[key] : `\${${key}}`))
}

function interpolateStep(step: TestStep, data: Record<string, string>): TestStep {
  const result: TestStep = { action: step.action }
  const out = result as unknown as Record<string, unknown>
  for (const [key, val] of Object.entries(step)) {
    if (typeof val === 'string') {
      out[key] = interpolateStr(val, data)
    } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      const nested: Record<string, unknown> = {}
      for (const [nk, nv] of Object.entries(val as Record<string, unknown>)) {
        nested[nk] = typeof nv === 'string' ? interpolateStr(nv, data) : nv
      }
      out[key] = nested
    } else {
      out[key] = val
    }
  }
  return result
}

// ─── Interpreter ──────────────────────────────────────────────────────────────

class PlaywrightTestInterpreter {
  private page!: Page
  private request!: APIRequestContext
  /** Per-test variable store — reset on setPage(). */
  private vars: Vars = new Map()

  setPage(page: Page): void {
    this.page = page
    this.request = page.request
    this.vars = new Map()
  }

  async executeSteps(steps: TestStep[], data: Record<string, string> = {}): Promise<void> {
    for (const rawStep of steps) {
      const step = Object.keys(data).length > 0 ? interpolateStep(rawStep, data) : rawStep
      try {
        if (await this.shouldSkip(step)) {
          console.log(`  ↷ skipped "${step.action}" (skipIf matched)`)
          continue
        }
        await this.executeStep(step)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        console.error(`  ✗ Failed step "${step.action}": ${msg}`)
        throw error
      }
    }
  }

  private async shouldSkip(step: TestStep): Promise<boolean> {
    if (!step.skipIf) return false
    const { selector, state } = step.skipIf
    const locator = this.page.locator(selector)
    try {
      switch (state) {
        case 'hidden':
          await locator.waitFor({ state: 'hidden', timeout: 2000 })
          return true
        case 'visible':
          await locator.waitFor({ state: 'visible', timeout: 2000 })
          return true
        case 'enabled':
          return await locator.isEnabled()
        case 'disabled':
          return await locator.isDisabled()
        default:
          return false
      }
    } catch {
      return false
    }
  }

  async executeStep(step: TestStep): Promise<void> {
    switch (step.action) {
      // ── Navigation ──────────────────────────────────────────────────────────
      case 'navigate':
        await this.page.goto(step.url as string, {
          waitUntil: (step.waitUntil as any) || 'domcontentloaded',
        })
        break

      case 'waitForLoadState':
        await this.page.waitForLoadState((step.state as any) || 'domcontentloaded')
        break

      case 'waitForURL':
        await this.page.waitForURL(step.urlPattern as string, {
          timeout: step.timeout ?? 5000,
        })
        break

      case 'waitForNavigation':
        await this.page.waitForNavigation()
        break

      case 'reload':
        await this.page.reload()
        break

      case 'goBack':
        await this.page.goBack()
        break

      case 'goForward':
        await this.page.goForward()
        break

      // ── Viewport ────────────────────────────────────────────────────────────
      case 'setViewport':
        await this.page.setViewportSize({
          width: step.width as number,
          height: step.height as number,
        })
        break

      // ── DOM interaction ──────────────────────────────────────────────────────
      case 'click':
        await this.getLocator(step).click()
        break

      case 'dblclick':
        await this.getLocator(step).dblclick()
        break

      case 'tap':
        await this.getLocator(step).tap()
        break

      case 'hover':
        await this.getLocator(step).hover()
        break

      case 'focus':
        await this.getLocator(step).focus()
        break

      case 'blur':
        await this.getLocator(step).blur()
        break

      case 'fill':
        await this.getLocator(step).fill(step.value as string)
        break

      case 'type':
        await this.getLocator(step).pressSequentially(step.text as string, {
          delay: step.delay ?? 50,
        })
        break

      case 'select':
        await this.page.locator(step.selector as string).selectOption(step.value as string)
        break

      case 'check':
        await this.getLocator(step).check()
        break

      case 'uncheck':
        await this.getLocator(step).uncheck()
        break

      case 'press':
        await this.getLocator(step).press(step.key as string)
        break

      case 'keyboard':
        for (const rawKey of [step.keys].flat()) {
          // Normalize shorthand modifier names to Playwright key names
          const key = (rawKey as string)
            .replace(/\bctrl\b/gi, 'Control')
            .replace(/\balt\b/gi, 'Alt')
            .replace(/\bmeta\b/gi, 'Meta')
            .replace(/\bshift\b/gi, 'Shift')
          await this.page.keyboard.press(key)
        }
        break

      case 'pageType':
        await this.page.keyboard.type(step.text as string)
        break

      case 'scroll':
        if (step.selector) {
          await this.page.locator(step.selector).scrollIntoViewIfNeeded()
        } else {
          await this.page.evaluate(
            ({ x, y }) => window.scrollTo(x, y),
            { x: step.x ?? 0, y: step.y ?? 0 },
          )
        }
        break

      // ── Waits ────────────────────────────────────────────────────────────────
      case 'wait':
        await this.page.waitForTimeout(step.timeout as number)
        break

      case 'waitForSelector':
        await this.page.waitForSelector(step.selector as string, {
          timeout: step.timeout ?? 5000,
          ...(step.state
            ? { state: step.state as 'attached' | 'detached' | 'visible' | 'hidden' }
            : {}),
        })
        break

      case 'waitForHidden':
        await this.page.waitForSelector(step.selector as string, {
          state: 'hidden',
          timeout: step.timeout ?? 5000,
        })
        break

      // ── Hooks — named TypeScript functions, no inline code ──────────────────
      case 'hook': {
        const hookName = step.name as string
        const fn = setupHooks[hookName]
        if (!fn) {
          throw new Error(
            `Unknown setup hook: "${hookName}". Available: ${Object.keys(setupHooks).join(', ')}`,
          )
        }
        await fn(this.page, step.args ?? {}, this.vars)
        break
      }

      case 'evalExpect': {
        const hookName = step.name as string
        const fn = evalHooks[hookName]
        if (!fn) {
          throw new Error(
            `Unknown eval hook: "${hookName}". Available: ${Object.keys(evalHooks).join(', ')}`,
          )
        }
        const result = await fn(this.page, step.args ?? {}, this.vars)
        await this.assertValue(result, step.assertion as Assertion)
        break
      }

      case 'store': {
        const hookName = step.name as string
        const varName = step.as as string
        const fn = evalHooks[hookName]
        if (!fn) {
          throw new Error(
            `Unknown eval hook: "${hookName}". Available: ${Object.keys(evalHooks).join(', ')}`,
          )
        }
        const result = await fn(this.page, step.args ?? {}, this.vars)
        this.vars.set(varName, result)
        break
      }

      // ── Screenshot ───────────────────────────────────────────────────────────
      case 'screenshot': {
        const clipVar = step.clipFrom ? this.vars.get(step.clipFrom) : undefined
        const clip = clipVar as { x: number; y: number; width: number; height: number } | undefined
        await this.page.screenshot({
          path: step.filename as string,
          fullPage: !!step.fullPage,
          ...(clip ? { clip } : {}),
        })
        break
      }

      // ── Assertions ───────────────────────────────────────────────────────────
      case 'expect':
        await this.handleExpect(step)
        break

      // ── API requests ─────────────────────────────────────────────────────────
      case 'apiRequest':
        await this.handleApiRequest(step)
        break

      // ── Legacy — avoid in new tests ──────────────────────────────────────────
      case 'evaluate':
        // Kept for backwards compatibility with tests.json. New tests should
        // use action:"hook" or action:"evalExpect" instead.
        await this.page.evaluate(step.script as string)
        break

      default:
        console.warn(`  ⚠ Unknown action: "${step.action}"`)
    }
  }

  // ── Locator resolution ────────────────────────────────────────────────────

  private getLocator(step: TestStep): Locator {
    const applyNth = (loc: Locator) =>
      typeof step.nth === 'number' ? loc.nth(step.nth) : loc

    if (step.testId)     return applyNth(this.page.getByTestId(step.testId))
    if (step.role) {
      const loc = step.text
        ? this.page.getByRole(step.role as any, { name: step.text })
        : this.page.getByRole(step.role as any)
      return applyNth(loc)
    }
    if (step.label)       return applyNth(this.page.getByLabel(step.label))
    if (step.placeholder) return applyNth(this.page.getByPlaceholder(step.placeholder))
    if (step.alt)         return applyNth(this.page.getByAltText(step.alt))
    if (step.title)       return applyNth(this.page.getByTitle(step.title))
    if (step.text)        return applyNth(this.page.getByText(step.text))
    if (step.selector)    return applyNth(this.page.locator(step.selector))
    throw new Error(`No locator strategy provided in step: ${JSON.stringify(step)}`)
  }

  // ── expect action ─────────────────────────────────────────────────────────

  private async handleExpect(step: TestStep): Promise<void> {
    const assertion = step.assertion as Assertion
    if (!assertion?.matcher) throw new Error('expect action requires an assertion.matcher')

    // Page-level matchers
    if (assertion.matcher === 'toHaveURL') {
      let expectedUrl = (assertion.url ?? assertion.expected) as string
      // Rewrite hardcoded http://localhost/pastebin URLs to match the actual test origin
      // so tests work with both port 80 (Docker stack) and dynamic ports (Testcontainers).
      if (expectedUrl && typeof expectedUrl === 'string') {
        const pageOrigin = new URL(this.page.url()).origin
        expectedUrl = expectedUrl.replace(/^http:\/\/localhost(?=\/pastebin)/, pageOrigin)
      }
      const base = assertion.not ? expect(this.page).not : expect(this.page)
      await (base as any).toHaveURL(expectedUrl, {
        timeout: assertion.timeout,
      })
      return
    }
    if (assertion.matcher === 'toHaveTitle') {
      const base = assertion.not ? expect(this.page).not : expect(this.page)
      await (base as any).toHaveTitle(assertion.title ?? assertion.expected, {
        timeout: assertion.timeout,
      })
      return
    }

    const locator = this.getLocator(step)
    const base = assertion.not ? expect(locator).not : expect(locator)
    const opts = assertion.timeout ? { timeout: assertion.timeout } : undefined

    switch (assertion.matcher) {
      case 'toBeVisible':     await (base as any).toBeVisible(opts);    break
      case 'toBeHidden':      await (base as any).toBeHidden(opts);     break
      case 'toBeEnabled':     await (base as any).toBeEnabled(opts);    break
      case 'toBeDisabled':    await (base as any).toBeDisabled(opts);   break
      case 'toBeChecked':     await (base as any).toBeChecked(opts);    break
      case 'toBeEditable':    await (base as any).toBeEditable(opts);   break
      case 'toBeEmpty':       await (base as any).toBeEmpty(opts);      break
      case 'toContainText':   await (base as any).toContainText(assertion.expected ?? assertion.text, opts); break
      case 'toHaveText':      await (base as any).toHaveText(assertion.expected ?? assertion.text, opts);    break
      case 'toHaveValue':     await (base as any).toHaveValue(assertion.value ?? assertion.expected, opts);  break
      case 'toHaveCount':     await (base as any).toHaveCount(assertion.count, opts);                        break
      case 'toHaveAttribute': await (base as any).toHaveAttribute(assertion.name, assertion.value, opts);    break
      case 'toHaveClass':     await (base as any).toHaveClass(assertion.className, opts);                    break
      case 'toHaveCSS':       await (base as any).toHaveCSS(assertion.property, assertion.value, opts);      break
      case 'toHaveScreenshot':await (base as any).toHaveScreenshot(assertion.name, opts);                    break
      case 'toBeInViewport': {
        const box = await locator.boundingBox()
        assertion.not ? expect(box).toBeNull() : expect(box).not.toBeNull()
        break
      }
      case 'custom':
        // Legacy: kept for backwards compatibility. Use evalExpect instead.
        await (assertion.not
          ? expect(await this.page.evaluate(assertion.script as string)).toBeFalsy()
          : expect(await this.page.evaluate(assertion.script as string)).toBeTruthy())
        break
      default:
        throw new Error(`Unknown expect matcher: "${assertion.matcher}"`)
    }
  }

  // ── evalExpect value assertions ──────────────────────────────────────────

  private async assertValue(value: unknown, assertion: Assertion): Promise<void> {
    if (!assertion?.matcher) throw new Error('evalExpect requires an assertion.matcher')
    const not = assertion.not === true

    switch (assertion.matcher) {
      case 'toBeTruthy':
        not ? expect(value).toBeFalsy() : expect(value).toBeTruthy()
        break
      case 'toBeFalsy':
        not ? expect(value).toBeTruthy() : expect(value).toBeFalsy()
        break
      case 'toBeNull':
        not ? expect(value).not.toBeNull() : expect(value).toBeNull()
        break
      case 'toEqual':
        not
          ? expect(value).not.toEqual(assertion.expected)
          : expect(value).toEqual(assertion.expected)
        break
      case 'toContain':
        not
          ? expect(value).not.toContain(assertion.expected)
          : expect(value).toContain(assertion.expected)
        break
      case 'toHaveLength':
        not
          ? expect(value as unknown[]).not.toHaveLength(assertion.count!)
          : expect(value as unknown[]).toHaveLength(assertion.count!)
        break
      case 'toBeEmpty':
        not
          ? expect(value as unknown[]).not.toHaveLength(0)
          : expect(value as unknown[]).toHaveLength(0)
        break
      case 'toMatch':
        not
          ? expect(String(value)).not.toMatch(new RegExp(assertion.pattern!))
          : expect(String(value)).toMatch(new RegExp(assertion.pattern!))
        break
      default:
        throw new Error(`Unknown evalExpect matcher: "${assertion.matcher}"`)
    }
  }

  // ── apiRequest action ────────────────────────────────────────────────────

  private async handleApiRequest(step: TestStep): Promise<void> {
    const method = ((step.method as string) || 'GET').toUpperCase()
    const url = step.url as string
    const assertion = step.assertion as { status?: number; bodyContains?: string } | undefined

    let response: Awaited<ReturnType<APIRequestContext['fetch']>>
    switch (method) {
      case 'GET':    response = await this.request.get(url); break
      case 'POST':   response = await this.request.post(url, { data: step.body }); break
      case 'PUT':    response = await this.request.put(url, { data: step.body }); break
      case 'PATCH':  response = await this.request.patch(url, { data: step.body }); break
      case 'DELETE': response = await this.request.delete(url); break
      default:       response = await this.request.fetch(url, { method }); break
    }

    if (assertion?.status !== undefined) expect(response.status()).toBe(assertion.status)
    if (assertion?.bodyContains !== undefined) expect(await response.text()).toContain(assertion.bodyContains)
  }
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Authenticate before each test by calling the Flask API to get a JWT token
 * and writing it directly to IndexedDB (redux-persist format). This avoids
 * the login form entirely — no JS bundle download, no React hydration wait.
 *
 * The page must navigate AFTER this call so redux-persist reads the token
 * on rehydration.
 */
async function loginViaApi(page: Page): Promise<void> {
  await setupHooks.loginViaApi(page, {}, new Map())
}

// ─── JSON discovery & test registration ──────────────────────────────────────

/** Files to skip when discovering JSON test suites. */
const JSON_SKIP = new Set(['md3-schema.json', 'tsconfig.json', 'package.json'])

const jsonFiles = readdirSync(__dirname)
  .filter((f) => f.endsWith('.json') && !JSON_SKIP.has(f))
  .sort()

for (const jsonFile of jsonFiles) {
  const filePath = join(__dirname, jsonFile)
  if (!existsSync(filePath)) continue

  let testDef: TestFile
  try {
    testDef = JSON.parse(readFileSync(filePath, 'utf-8')) as TestFile
  } catch (err) {
    console.error(`Failed to parse ${jsonFile}:`, err)
    continue
  }

  if (!Array.isArray(testDef.tests) || testDef.tests.length === 0) continue

  const suiteName = testDef.suite ?? testDef.description ?? testDef.package ?? basename(jsonFile, '.json')

  test.describe(suiteName, () => {
    // Login before every test so AuthGuard doesn't redirect
    test.beforeEach(async ({ page }) => {
      await loginViaApi(page)
    })

    for (const testCase of testDef.tests) {
      registerTest(testCase)
    }
  })
}

function registerTest(testCase: TestCase): void {
  const testFn = testCase.skip ? test.skip : testCase.only ? test.only : test

  // ── Describe group: testCase has beforeEach / afterEach ──────────────────
  if (testCase.beforeEach || testCase.afterEach) {
    test.describe(testCase.name, () => {
      const interpreter = new PlaywrightTestInterpreter()

      test.beforeEach(async ({ page }) => {
        interpreter.setPage(page)
        if (testCase.beforeEach) await interpreter.executeSteps(testCase.beforeEach)
      })

      test.afterEach(async ({ page }) => {
        interpreter.setPage(page)
        if (testCase.afterEach) await interpreter.executeSteps(testCase.afterEach)
      })

      if (testCase.parameterize?.data) {
        for (const dataRow of testCase.parameterize.data) {
          const label = dataRow.label ?? JSON.stringify(dataRow)
          testFn(`${testCase.name} [${label}]`, async ({ page }) => {
            if (testCase.timeout) test.setTimeout(testCase.timeout)
            interpreter.setPage(page)
            await interpreter.executeSteps(testCase.steps, dataRow)
          })
        }
      } else {
        testFn(testCase.name, async ({ page }) => {
          if (testCase.timeout) test.setTimeout(testCase.timeout)
          interpreter.setPage(page)
          await interpreter.executeSteps(testCase.steps)
        })
      }
    })
    return
  }

  // ── Parameterised (no hooks) ─────────────────────────────────────────────
  if (testCase.parameterize?.data) {
    for (const dataRow of testCase.parameterize.data) {
      const label = dataRow.label ?? JSON.stringify(dataRow)
      testFn(`${testCase.name} [${label}]`, async ({ page }) => {
        if (testCase.timeout) test.setTimeout(testCase.timeout)
        const interpreter = new PlaywrightTestInterpreter()
        interpreter.setPage(page)
        await interpreter.executeSteps(testCase.steps, dataRow)
      })
    }
    return
  }

  // ── Plain test ───────────────────────────────────────────────────────────
  testFn(testCase.name, async ({ page }) => {
    if (testCase.timeout) test.setTimeout(testCase.timeout)
    const interpreter = new PlaywrightTestInterpreter()
    interpreter.setPage(page)
    await interpreter.executeSteps(testCase.steps)
  })
}
