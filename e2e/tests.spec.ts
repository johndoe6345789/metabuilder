import { test, expect } from '@playwright/test'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

function discoverAndRegisterTests() {
  const packagesDir = resolve(__dirname, '../packages')

  if (!existsSync(packagesDir)) {
    return
  }

  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })

  for (const dir of packageDirs) {
    if (dir.isDirectory()) {
      const testPath = join(packagesDir, dir.name, 'playwright', 'tests.json')
      if (existsSync(testPath)) {
        try {
          const content = readFileSync(testPath, 'utf-8')
          const testDef = JSON.parse(content)

          test.describe(`${testDef.package}`, () => {
            testDef.tests.forEach((testCase: any) => {
              test(testCase.name, async ({ page }) => {
                for (const step of testCase.steps) {
                  if (step.action === 'navigate') {
                    await page.goto(step.url)
                  } else if (step.action === 'waitForLoadState') {
                    await page.waitForLoadState(step.state)
                  } else if (step.action === 'expect') {
                    if (step.role === 'heading') {
                      const heading = page.locator('h1, h2, h3, h4, h5, h6')
                      await expect(heading).toBeVisible()
                    } else if (step.role === 'button') {
                      const button = page.locator(`button:has-text("${step.text}")`)
                      await expect(button).toBeVisible()
                    }
                  } else if (step.action === 'click') {
                    const element = page.locator(`button:has-text("${step.text}")`)
                    await element.click()
                  } else if (step.action === 'fill') {
                    const input = page.locator(step.selector)
                    await input.fill(step.value)
                  } else if (step.action === 'waitForNavigation') {
                    await page.waitForNavigation()
                  } else if (step.action === 'evaluate') {
                    await page.evaluate(step.script)
                  } else if (step.action === 'wait') {
                    await page.waitForTimeout(step.timeout)
                  }
                }
              })
            })
          })
        } catch (error) {
          console.error(`Error loading tests from ${dir.name}:`, error)
        }
      }
    }
  }
}

discoverAndRegisterTests()
