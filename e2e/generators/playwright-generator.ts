/**
 * Playwright Test Generator
 * 
 * Generates executable Playwright .spec.ts files from declarative JSON test definitions
 * in packages/*/playwright/tests.json
 * 
 * Usage:
 *   import { generatePlaywrightTests } from '@/lib/generators/playwright-generator'
 *   await generatePlaywrightTests('ui_home')
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

export interface PlaywrightTestDefinition {
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

export interface SetupStep {
  action: string
  description?: string
  [key: string]: unknown
}

export interface TestCase {
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

export interface TestStep {
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

export interface Assertion {
  matcher: string
  expected?: unknown
  not?: boolean
  timeout?: number
}

/**
 * Generate Playwright test file from JSON definition
 */
export async function generatePlaywrightTest(
  packageName: string,
  packagesDir: string,
  outputDir: string
): Promise<string> {
  // Read the test definition
  const testDefPath = join(packagesDir, packageName, 'playwright', 'tests.json')
  
  if (!existsSync(testDefPath)) {
    throw new Error(`No playwright tests found for package: ${packageName}`)
  }

  const testDefContent = await readFile(testDefPath, 'utf-8')
  const testDef: PlaywrightTestDefinition = JSON.parse(testDefContent)

  // Generate TypeScript code
  const code = generateTestCode(testDef)

  // Write to output directory
  const outputPath = join(outputDir, `${packageName}.spec.ts`)
  await mkdir(dirname(outputPath), { recursive: true })
  await writeFile(outputPath, code, 'utf-8')

  return outputPath
}

/**
 * Generate TypeScript code from test definition
 */
function generateTestCode(testDef: PlaywrightTestDefinition): string {
  const lines: string[] = []

  // Header
  lines.push(`/**`)
  lines.push(` * Auto-generated Playwright tests for ${testDef.package} package`)
  lines.push(` * Generated from: packages/${testDef.package}/playwright/tests.json`)
  lines.push(` * DO NOT EDIT - This file is auto-generated`)
  lines.push(` */`)
  lines.push(``)
  lines.push(`import { test, expect } from '@playwright/test'`)
  lines.push(``)

  if (testDef.description) {
    lines.push(`/**`)
    lines.push(` * ${testDef.description}`)
    lines.push(` */`)
  }

  lines.push(`test.describe('${testDef.package} Package Tests', () => {`)

  // Generate setup hooks
  if (testDef.setup?.beforeAll) {
    lines.push(`  test.beforeAll(async () => {`)
    testDef.setup.beforeAll.forEach(step => {
      lines.push(`    // ${step.description || step.action}`)
    })
    lines.push(`  })`)
    lines.push(``)
  }

  if (testDef.setup?.beforeEach) {
    lines.push(`  test.beforeEach(async ({ page }) => {`)
    testDef.setup.beforeEach.forEach(step => {
      lines.push(`    // ${step.description || step.action}`)
    })
    lines.push(`  })`)
    lines.push(``)
  }

  // Generate test cases
  testDef.tests.forEach(testCase => {
    generateTestCase(testCase, lines)
  })

  lines.push(`})`)
  lines.push(``)

  return lines.join('\n')
}

/**
 * Generate a single test case
 */
function generateTestCase(testCase: TestCase, lines: string[]): void {
  // Test declaration
  let testDecl = '  test'
  if (testCase.skip) testDecl += '.skip'
  if (testCase.only) testDecl += '.only'
  
  testDecl += `('${testCase.name}', async ({ page }) => {`
  lines.push(testDecl)

  // Test configuration
  if (testCase.timeout) {
    lines.push(`    test.setTimeout(${testCase.timeout})`)
  }

  // Test steps
  testCase.steps.forEach(step => {
    if (step.description) {
      lines.push(`    // ${step.description}`)
    }
    
    const stepCode = generateStepCode(step)
    lines.push(`    ${stepCode}`)
  })

  lines.push(`  })`)
  lines.push(``)
}

/**
 * Generate code for a single test step
 */
function generateStepCode(step: TestStep): string {
  switch (step.action) {
    case 'navigate':
      return `await page.goto('${step.url}')`

    case 'click':
      return `await ${getLocator(step)}.click()`

    case 'dblclick':
      return `await ${getLocator(step)}.dblclick()`

    case 'fill':
      return `await ${getLocator(step)}.fill('${step.value}')`

    case 'type':
      return `await ${getLocator(step)}.type('${step.value}')`

    case 'select':
      return `await ${getLocator(step)}.selectOption('${step.value}')`

    case 'check':
      return `await ${getLocator(step)}.check()`

    case 'uncheck':
      return `await ${getLocator(step)}.uncheck()`

    case 'hover':
      return `await ${getLocator(step)}.hover()`

    case 'focus':
      return `await ${getLocator(step)}.focus()`

    case 'press':
      return `await page.keyboard.press('${step.key}')`

    case 'wait':
      return `await page.waitForTimeout(${step.timeout || 1000})`

    case 'waitForSelector':
      return `await page.waitForSelector('${step.selector}'${step.timeout ? `, { timeout: ${step.timeout} }` : ''})`

    case 'waitForNavigation':
      return `await page.waitForNavigation()`

    case 'waitForLoadState':
      return `await page.waitForLoadState('${step.state || 'load'}')`

    case 'screenshot':
      return `await page.screenshot({ path: '${step.path}'${step.fullPage ? ', fullPage: true' : ''} })`

    case 'evaluate':
      return `await page.evaluate(() => { ${step.script} })`

    case 'expect':
      return generateAssertion(step)

    default:
      return `// Unknown action: ${step.action}`
  }
}

/**
 * Get locator string for a step
 */
function getLocator(step: TestStep): string {
  if (step.selector) {
    return `page.locator('${step.selector}')`
  }
  if (step.role) {
    const opts: string[] = []
    if (step.text) opts.push(`name: /${step.text}/i`)
    const optsStr = opts.length > 0 ? `{ ${opts.join(', ')} }` : ''
    return `page.getByRole('${step.role}'${optsStr ? `, ${optsStr}` : ''})`
  }
  if (step.text) {
    return `page.getByText('${step.text}')`
  }
  if (step.label) {
    return `page.getByLabel('${step.label}')`
  }
  if (step.placeholder) {
    return `page.getByPlaceholder('${step.placeholder}')`
  }
  if (step.testId) {
    return `page.getByTestId('${step.testId}')`
  }
  return 'page'
}

/**
 * Generate assertion code
 */
function generateAssertion(step: TestStep): string {
  if (!step.assertion) {
    return '// No assertion specified'
  }

  const locator = getLocator(step)
  const { matcher, expected, not, timeout } = step.assertion

  let assertion = `await expect(${locator})`
  if (not) assertion += '.not'
  
  assertion += `.${matcher}(`

  // Add expected value if needed
  if (expected !== undefined) {
    if (typeof expected === 'string') {
      assertion += `'${expected}'`
    } else if (typeof expected === 'number') {
      assertion += expected.toString()
    } else {
      assertion += JSON.stringify(expected)
    }
  }

  assertion += ')'

  // Add timeout if specified
  if (timeout) {
    assertion = assertion.slice(0, -1) + `, { timeout: ${timeout} })`
  }

  return assertion
}

/**
 * Discover all packages with Playwright tests
 */
export async function discoverPlaywrightPackages(packagesDir: string): Promise<string[]> {
  const { readdir } = await import('fs/promises')
  const packages: string[] = []

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
 * Generate tests for all packages
 */
export async function generateAllPlaywrightTests(
  packagesDir: string,
  outputDir: string
): Promise<string[]> {
  const packages = await discoverPlaywrightPackages(packagesDir)
  const generated: string[] = []

  for (const pkg of packages) {
    try {
      const path = await generatePlaywrightTest(pkg, packagesDir, outputDir)
      generated.push(path)
      console.log(`✓ Generated: ${path}`)
    } catch (error) {
      console.error(`✗ Failed to generate tests for ${pkg}:`, error)
    }
  }

  return generated
}
