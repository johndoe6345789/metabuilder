import { test, expect, Page, Locator } from '@playwright/test'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'

interface TestStep {
  action: string
  description?: string
  [key: string]: unknown
}

class PlaywrightTestInterpreter {
  private page!: Page

  async executeStep(step: TestStep): Promise<void> {
    switch (step.action) {
      case 'navigate':
        await this.handleNavigate(step)
        break
      case 'waitForLoadState':
        await this.handleWaitForLoadState(step)
        break
      case 'click':
        await this.handleClick(step)
        break
      case 'fill':
        await this.handleFill(step)
        break
      case 'select':
        await this.handleSelect(step)
        break
      case 'hover':
        await this.handleHover(step)
        break
      case 'focus':
        await this.handleFocus(step)
        break
      case 'blur':
        await this.handleBlur(step)
        break
      case 'expect':
        await this.handleExpect(step)
        break
      case 'waitForNavigation':
        await this.page.waitForNavigation()
        break
      case 'waitForSelector':
        await this.handleWaitForSelector(step)
        break
      case 'waitForURL':
        await this.handleWaitForURL(step)
        break
      case 'evaluate':
        await this.page.evaluate(step.script as string)
        break
      case 'wait':
        await this.page.waitForTimeout(step.timeout as number)
        break
      case 'screenshot':
        await this.handleScreenshot(step)
        break
      case 'type':
        await this.handleType(step)
        break
      case 'press':
        await this.handlePress(step)
        break
      case 'keyboard':
        await this.handleKeyboard(step)
        break
      case 'scroll':
        await this.handleScroll(step)
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
      default:
        console.warn(`Unknown action: ${step.action}`)
    }
  }

  private getLocator(step: any): Locator {
    if (step.testId) {
      return this.page.getByTestId(step.testId)
    }
    if (step.role) {
      if (step.text) {
        return this.page.getByRole(step.role as any, { name: step.text as string })
      }
      return this.page.getByRole(step.role as any)
    }
    if (step.label) {
      return this.page.getByLabel(step.label as string)
    }
    if (step.placeholder) {
      return this.page.getByPlaceholder(step.placeholder as string)
    }
    if (step.alt) {
      return this.page.getByAltText(step.alt as string)
    }
    if (step.title) {
      return this.page.getByTitle(step.title as string)
    }
    if (step.text) {
      return this.page.getByText(step.text as string)
    }
    if (step.selector) {
      return this.page.locator(step.selector as string)
    }
    throw new Error('No locator strategy provided in step')
  }

  private async handleNavigate(step: any): Promise<void> {
    const url = step.url as string
    await this.page.goto(url, { waitUntil: step.waitUntil || 'domcontentloaded' })
  }

  private async handleWaitForLoadState(step: any): Promise<void> {
    const state = step.state || 'domcontentloaded'
    await this.page.waitForLoadState(state as any)
  }

  private async handleClick(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await locator.click({
      button: step.button || 'left',
      clickCount: step.clickCount || 1,
      delay: step.delay || 0,
    })
  }

  private async handleFill(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await locator.fill(step.value as string)
  }

  private async handleSelect(step: any): Promise<void> {
    const locator = this.page.locator(step.selector as string)
    const values = Array.isArray(step.value) ? step.value : [step.value]
    await locator.selectOption(values as string[])
  }

  private async handleHover(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await locator.hover()
  }

  private async handleFocus(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await locator.focus()
  }

  private async handleBlur(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await locator.blur()
  }

  private async handleExpect(step: any): Promise<void> {
    const locator = this.getLocator(step)
    const assertion = step.assertion

    if (!assertion?.matcher) {
      throw new Error('No matcher provided in assertion')
    }

    switch (assertion.matcher) {
      case 'toBeVisible':
        await expect(locator).toBeVisible()
        break
      case 'toBeHidden':
        await expect(locator).toBeHidden()
        break
      case 'toBeEnabled':
        await expect(locator).toBeEnabled()
        break
      case 'toBeDisabled':
        await expect(locator).toBeDisabled()
        break
      case 'toBeChecked':
        await expect(locator).toBeChecked()
        break
      case 'toBeEmpty':
        await expect(locator).toBeEmpty()
        break
      case 'toBeEditable':
        await expect(locator).toBeEditable()
        break
      case 'toContainText':
        await expect(locator).toContainText(assertion.text as string)
        break
      case 'toHaveText':
        await expect(locator).toHaveText(assertion.text as string)
        break
      case 'toHaveAttribute':
        await expect(locator).toHaveAttribute(assertion.name as string, assertion.value as string)
        break
      case 'toHaveClass':
        await expect(locator).toHaveClass(assertion.className as string | RegExp)
        break
      case 'toHaveValue':
        await expect(locator).toHaveValue(assertion.value as string)
        break
      case 'toHaveCount':
        await expect(locator).toHaveCount(assertion.count as number)
        break
      case 'toHaveCSS':
        await expect(locator).toHaveCSS(assertion.property as string, assertion.value as string)
        break
      case 'toHaveScreenshot':
        await expect(locator).toHaveScreenshot(assertion.name as string)
        break
      case 'toBeInViewport':
        const box = await locator.boundingBox()
        expect(box).not.toBeNull()
        break
      case 'toHaveURL':
        await expect(this.page).toHaveURL(assertion.url as string)
        break
      case 'toHaveTitle':
        await expect(this.page).toHaveTitle(assertion.title as string)
        break
      case 'custom':
        const result = await this.page.evaluate(assertion.script as string)
        expect(result).toBeTruthy()
        break
      default:
        throw new Error(`Unknown matcher: ${assertion.matcher}`)
    }
  }

  private async handleWaitForSelector(step: any): Promise<void> {
    const selector = step.selector as string
    const timeout = step.timeout || 5000
    await this.page.waitForSelector(selector, { timeout })
  }

  private async handleWaitForURL(step: any): Promise<void> {
    const urlPattern = step.urlPattern as string
    const timeout = step.timeout || 5000
    await this.page.waitForURL(urlPattern, { timeout })
  }

  private async handleScreenshot(step: any): Promise<void> {
    const filename = step.filename || `screenshot-${Date.now()}.png`
    await this.page.screenshot({ path: filename, fullPage: step.fullPage || false })
  }

  private async handleType(step: any): Promise<void> {
    const locator = this.getLocator(step)
    const text = step.text as string
    const delay = step.delay || 50
    await locator.type(text, { delay })
  }

  private async handlePress(step: any): Promise<void> {
    const locator = this.getLocator(step)
    const key = step.key as string
    await locator.press(key)
  }

  private async handleKeyboard(step: any): Promise<void> {
    const keys = step.keys as string | string[]
    if (Array.isArray(keys)) {
      for (const key of keys) {
        await this.page.keyboard.press(key)
      }
    } else {
      await this.page.keyboard.press(keys)
    }
  }

  private async handleScroll(step: any): Promise<void> {
    if (step.selector) {
      const locator = this.page.locator(step.selector as string)
      await locator.scrollIntoViewIfNeeded()
    } else if (step.x !== undefined && step.y !== undefined) {
      await this.page.evaluate(({ x, y }) => window.scrollTo(x, y), { x: step.x, y: step.y })
    }
  }

  setPage(page: Page): void {
    this.page = page
  }
}

function discoverAndRegisterTests(): void {
  const packagesDir = resolve(__dirname, '../packages')

  if (!existsSync(packagesDir)) {
    return
  }

  const packageDirs = readdirSync(packagesDir, { withFileTypes: true })

  for (const dir of packageDirs) {
    if (!dir.isDirectory()) continue

    const testPath = join(packagesDir, dir.name, 'playwright', 'tests.json')
    if (!existsSync(testPath)) continue

    try {
      const content = readFileSync(testPath, 'utf-8')
      const testDef = JSON.parse(content)

      test.describe(`${testDef.package}`, () => {
        if (!Array.isArray(testDef.tests)) {
          console.warn(`Invalid tests array in ${dir.name}`)
          return
        }

        testDef.tests.forEach((testCase: any) => {
          const testFn = testCase.skip ? test.skip : testCase.only ? test.only : test

          testFn(testCase.name, async ({ page }) => {
            if (testCase.timeout) {
              test.setTimeout(testCase.timeout)
            }

            const interpreter = new PlaywrightTestInterpreter()
            interpreter.setPage(page)

            if (!Array.isArray(testCase.steps)) {
              throw new Error(`Invalid steps array in test: ${testCase.name}`)
            }

            for (const step of testCase.steps) {
              try {
                await interpreter.executeStep(step)
              } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error)
                console.error(`Failed step in test "${testCase.name}": ${step.action} - ${errorMsg}`)
                throw error
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

discoverAndRegisterTests()
