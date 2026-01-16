/**
 * JSON Playwright Test Runner
 * 
 * Directly executes Playwright tests from JSON definitions without code generation.
 * Tests are interpreted at runtime from packages/*/playwright/tests.json
 * 
 * This is the meta/abstract approach - JSON itself is executable, not just a template.
 */

import { test as baseTest, expect, Page } from '@playwright/test'
import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

interface PlaywrightTestDefinition {
  $schema: string
  package: string
  version?: string
  description?: string
  baseURL?: string
  setup?: {
    beforeAll?: SetupStep[]
    beforeEach?: SetupStep[]
    afterEach?: SetupStep[]
    afterAll?: SetupStep[]
  }
  fixtures?: Record<string, unknown>
  tests: TestCase[]
}

interface SetupStep {
  action: string
  description?: string
  [key: string]: unknown
}

interface TestCase {
  name: string
  description?: string
  skip?: boolean
  only?: boolean
  timeout?: number
  retries?: number
  tags?: string[]
  fixtures?: Record<string, unknown>
  steps: TestStep[]
}

interface TestStep {
  description?: string
  action: string
  url?: string
  selector?: string
  role?: string
  text?: string
  label?: string
  placeholder?: string
  testId?: string
  value?: unknown
  key?: string
  timeout?: number
  assertion?: Assertion
  state?: string
  path?: string
  fullPage?: boolean
  script?: string
  condition?: string
}

interface Assertion {
  matcher: string
  expected?: unknown
  not?: boolean
  timeout?: number
}

/**
 * Discover all packages with Playwright test definitions
 */
export async function discoverTestPackages(packagesDir: string): Promise<string[]> {
  const packages: string[] = []
  
  if (!existsSync(packagesDir)) {
    return packages
  }

  const packageDirs = await readdir(packagesDir, { withFileTypes: true })

  for (const dir of packageDirs) {
    if (dir.isDirectory()) {
      const testPath = join(packagesDir, dir.name, 'playwright', 'tests.json')
      if (existsSync(testPath)) {
        packages.push(dir.name)
      }
    }
  }

  return packages
}

/**
 * Load test definition from package
 */
export async function loadTestDefinition(packageName: string, packagesDir: string): Promise<PlaywrightTestDefinition> {
  const testPath = join(packagesDir, packageName, 'playwright', 'tests.json')
  const content = await readFile(testPath, 'utf-8')
  return JSON.parse(content)
}

/**
 * Execute a test step
 */
async function executeStep(step: TestStep, page: Page): Promise<void> {
  if (step.description) {
    // Log step description for debugging
    console.log(`  → ${step.description}`)
  }

  switch (step.action) {
    case 'navigate':
      await page.goto(step.url!)
      break

    case 'click':
      await getLocator(step, page).click()
      break

    case 'dblclick':
      await getLocator(step, page).dblclick()
      break

    case 'fill':
      await getLocator(step, page).fill(String(step.value))
      break

    case 'type':
      await getLocator(step, page).pressSequentially(String(step.value))
      break

    case 'select':
      await getLocator(step, page).selectOption(String(step.value))
      break

    case 'check':
      await getLocator(step, page).check()
      break

    case 'uncheck':
      await getLocator(step, page).uncheck()
      break

    case 'hover':
      await getLocator(step, page).hover()
      break

    case 'focus':
      await getLocator(step, page).focus()
      break

    case 'press':
      await page.keyboard.press(step.key!)
      break

    case 'wait':
      await page.waitForTimeout(step.timeout || 1000)
      break

    case 'waitForSelector':
      await page.waitForSelector(step.selector!, step.timeout ? { timeout: step.timeout } : undefined)
      break

    case 'waitForNavigation':
      await page.waitForLoadState('networkidle')
      break

    case 'waitForLoadState':
      await page.waitForLoadState((step.state || 'load') as 'load' | 'domcontentloaded' | 'networkidle')
      break

    case 'screenshot':
      await page.screenshot({
        path: step.path,
        fullPage: step.fullPage
      })
      break

    case 'evaluate':
      await page.evaluate(step.script!)
      break

    case 'expect':
      await executeAssertion(step, page)
      break

    default:
      throw new Error(`Unknown action: ${step.action}`)
  }
}

/**
 * Get locator for a step
 */
function getLocator(step: TestStep, page: Page) {
  if (step.selector) {
    return page.locator(step.selector)
  }
  if (step.role) {
    const options: any = {}
    if (step.text) options.name = new RegExp(step.text, 'i')
    return page.getByRole(step.role as any, options)
  }
  if (step.text) {
    return page.getByText(step.text)
  }
  if (step.label) {
    return page.getByLabel(step.label)
  }
  if (step.placeholder) {
    return page.getByPlaceholder(step.placeholder)
  }
  if (step.testId) {
    return page.getByTestId(step.testId)
  }
  throw new Error('No selector specified for step')
}

/**
 * Execute an assertion
 */
async function executeAssertion(step: TestStep, page: Page): Promise<void> {
  if (!step.assertion) {
    throw new Error('No assertion specified')
  }

  const locator = getLocator(step, page)
  const { matcher, expected, not, timeout } = step.assertion

  let assertion = expect(locator)
  if (not) assertion = assertion.not as any

  const options = timeout ? { timeout } : undefined

  // Execute the matcher
  switch (matcher) {
    case 'toBeVisible':
      await assertion.toBeVisible(options)
      break
    case 'toBeHidden':
      await assertion.toBeHidden(options)
      break
    case 'toBeEnabled':
      await assertion.toBeEnabled(options)
      break
    case 'toBeDisabled':
      await assertion.toBeDisabled(options)
      break
    case 'toBeChecked':
      await assertion.toBeChecked(options)
      break
    case 'toBeFocused':
      await assertion.toBeFocused(options)
      break
    case 'toBeEmpty':
      await assertion.toBeEmpty(options)
      break
    case 'toHaveText':
      await assertion.toHaveText(String(expected), options)
      break
    case 'toContainText':
      await assertion.toContainText(String(expected), options)
      break
    case 'toHaveValue':
      await assertion.toHaveValue(String(expected), options)
      break
    case 'toHaveCount':
      await assertion.toHaveCount(Number(expected), options)
      break
    case 'toHaveAttribute':
      // Expected should be [name, value]
      if (Array.isArray(expected) && expected.length === 2) {
        await assertion.toHaveAttribute(expected[0], expected[1], options)
      }
      break
    case 'toHaveClass':
      await assertion.toHaveClass(expected as any, options)
      break
    case 'toHaveCSS':
      // Expected should be [name, value]
      if (Array.isArray(expected) && expected.length === 2) {
        await assertion.toHaveCSS(expected[0], expected[1], options)
      }
      break
    case 'toHaveURL':
      await (assertion as any).toHaveURL(String(expected), options)
      break
    case 'toHaveTitle':
      await (assertion as any).toHaveTitle(String(expected), options)
      break
    default:
      throw new Error(`Unknown matcher: ${matcher}`)
  }
}

/**
 * Register tests from a JSON definition
 */
export function registerTestsFromJSON(testDef: PlaywrightTestDefinition, testFn = baseTest) {
  testFn.describe(`${testDef.package} Package Tests (from JSON)`, () => {
    // Setup hooks
    if (testDef.setup?.beforeAll) {
      testFn.beforeAll(async () => {
        console.log(`[Setup] beforeAll for ${testDef.package}`)
        // Setup steps would be executed here
      })
    }

    if (testDef.setup?.beforeEach) {
      testFn.beforeEach(async ({ page }) => {
        console.log(`[Setup] beforeEach for ${testDef.package}`)
        // Setup steps would be executed here
      })
    }

    // Register each test
    testDef.tests.forEach(testCase => {
      let test = testFn
      if (testCase.skip) test = test.skip
      if (testCase.only) test = test.only

      test(testCase.name, async ({ page }) => {
        if (testCase.timeout) {
          test.setTimeout(testCase.timeout)
        }

        console.log(`\n[Test] ${testCase.name}`)
        
        // Execute all steps
        for (const step of testCase.steps) {
          await executeStep(step, page)
        }
      })
    })
  })
}

/**
 * Load and register all package tests
 */
export async function loadAllPackageTests(packagesDir: string, testFn = baseTest) {
  const packages = await discoverTestPackages(packagesDir)
  
  for (const packageName of packages) {
    const testDef = await loadTestDefinition(packageName, packagesDir)
    registerTestsFromJSON(testDef, testFn)
  }
}
