import { PlaywrightTest } from '@/types/project'

export function generatePlaywrightTests(tests: PlaywrightTest[]): string {
  if (tests.length === 0) {
    return `import { test, expect } from '@playwright/test'

test('example test', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.*/)
})`
  }

  let code = `import { test, expect } from '@playwright/test'\n\n`

  tests.forEach(testSuite => {
    code += `test.describe('${testSuite.name}', () => {\n`
    if (testSuite.description) {
      code += `  // ${testSuite.description}\n`
    }
    code += `  test('${testSuite.name}', async ({ page }) => {\n`

    testSuite.steps.forEach(step => {
      switch (step.action) {
        case 'navigate':
          code += `    await page.goto('${testSuite.pageUrl}')\n`
          break
        case 'click':
          code += `    await page.click('${step.selector}')\n`
          break
        case 'fill':
          code += `    await page.fill('${step.selector}', '${step.value}')\n`
          break
        case 'expect':
          code += `    await expect(page.locator('${step.selector}')).${step.assertion}\n`
          break
        case 'wait':
          code += `    await page.waitForTimeout(${step.timeout || 1000})\n`
          break
        case 'select':
          code += `    await page.selectOption('${step.selector}', '${step.value}')\n`
          break
        case 'check':
          code += `    await page.check('${step.selector}')\n`
          break
        case 'uncheck':
          code += `    await page.uncheck('${step.selector}')\n`
          break
      }
    })

    code += `  })\n`
    code += `})\n\n`
  })

  return code
}
