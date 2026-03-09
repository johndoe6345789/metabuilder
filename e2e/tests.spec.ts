import { test, expect, Page, Locator } from '@playwright/test'
import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      case 'mockApi':
        await this.handleMockApi(step)
        break
      case 'waitForResponse':
        await this.handleWaitForResponse(step)
        break
      case 'waitForRequest':
        await this.handleWaitForRequest(step)
        break
      case 'expectCount':
        await this.handleExpectCount(step)
        break
      case 'expectNotVisible':
        await this.handleExpectNotVisible(step)
        break
      case 'dragAndDrop':
        await this.handleDragAndDrop(step)
        break
      case 'inspectElement':
        await this.handleInspectElement(step)
        break
      case 'getComputedStyle':
        await this.handleGetComputedStyle(step)
        break
      case 'getAllText':
        await this.handleGetAllText(step)
        break
      case 'findByText':
        await this.handleFindByText(step)
        break
      case 'debugScreenshot':
        await this.handleDebugScreenshot(step)
        break
      case 'inspectPageStructure':
        await this.handleInspectPageStructure(step)
        break
      case 'waitForElement':
        await this.handleWaitForElement(step)
        break
      case 'retry':
        await this.handleRetry(step)
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
    // Playwright's page.goto() handles relative URLs automatically using baseURL from config
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
    const assertion = step.assertion

    if (!assertion?.matcher) {
      throw new Error('No matcher provided in assertion')
    }

    // Page-level assertions don't need a locator
    if (assertion.matcher === 'toHaveURL') {
      await expect(this.page).toHaveURL(assertion.url as string)
      return
    }
    if (assertion.matcher === 'toHaveTitle') {
      await expect(this.page).toHaveTitle(assertion.title as string)
      return
    }

    const locator = this.getLocator(step)

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
        await expect(locator).toContainText((assertion.expected || assertion.text) as string)
        break
      case 'toHaveText':
        await expect(locator).toHaveText((assertion.expected || assertion.text) as string)
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

  private async handleMockApi(step: any): Promise<void> {
    const url = step.url as string
    const method = step.method?.toUpperCase() || 'GET'
    const response = step.response || {}
    const status = step.status || 200

    await this.page.route(url, async (route) => {
      if (route.request().method() === method) {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(response),
        })
      } else {
        await route.continue()
      }
    })
  }

  private async handleWaitForResponse(step: any): Promise<void> {
    const urlPattern = step.urlPattern as string
    const timeout = step.timeout || 5000
    await this.page.waitForResponse(
      (response) => response.url().includes(urlPattern),
      { timeout }
    )
  }

  private async handleWaitForRequest(step: any): Promise<void> {
    const urlPattern = step.urlPattern as string
    const timeout = step.timeout || 5000
    await this.page.waitForRequest(
      (request) => request.url().includes(urlPattern),
      { timeout }
    )
  }

  private async handleExpectCount(step: any): Promise<void> {
    const locator = this.getLocator(step)
    const count = step.count as number
    await expect(locator).toHaveCount(count)
  }

  private async handleExpectNotVisible(step: any): Promise<void> {
    const locator = this.getLocator(step)
    await expect(locator).not.toBeVisible()
  }

  private async handleDragAndDrop(step: any): Promise<void> {
    const sourceSelector = step.source as string
    const targetSelector = step.target as string

    const source = this.page.locator(sourceSelector)
    const target = this.page.locator(targetSelector)

    await source.dragTo(target)
  }

  private async handleInspectElement(step: any): Promise<void> {
    const selector = step.selector as string
    const locator = this.page.locator(selector)

    const elementInfo = await locator.evaluate((el) => {
      const rect = el.getBoundingClientRect()
      const styles = window.getComputedStyle(el)

      return {
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.trim(),
        attributes: Array.from(el.attributes).map(attr => ({
          name: attr.name,
          value: attr.value
        })),
        boundingBox: {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        computedStyle: {
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          position: styles.position,
          zIndex: styles.zIndex
        },
        children: el.children.length,
        innerHTML: el.innerHTML.substring(0, 200) // First 200 chars
      }
    })

    console.log('🔍 Element Inspection:', JSON.stringify(elementInfo, null, 2))
  }

  private async handleGetComputedStyle(step: any): Promise<void> {
    const selector = step.selector as string
    const property = step.property as string

    const value = await this.page.locator(selector).evaluate((el, prop) => {
      return window.getComputedStyle(el).getPropertyValue(prop)
    }, property)

    console.log(`🎨 Computed style ${property}:`, value)
  }

  private async handleGetAllText(step: any): Promise<void> {
    const allText = await this.page.evaluate(() => {
      return document.body.innerText
    })

    console.log('📄 All page text:', allText.substring(0, 500))
  }

  private async handleFindByText(step: any): Promise<void> {
    const searchText = step.text as string

    const matches = await this.page.evaluate((text) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      )

      const results: any[] = []
      let node: Node | null

      while (node = walker.nextNode()) {
        if (node.textContent?.includes(text)) {
          const element = node.parentElement
          results.push({
            text: node.textContent.trim(),
            tagName: element?.tagName,
            className: element?.className,
            id: element?.id
          })
        }
      }

      return results.slice(0, 10) // Max 10 matches
    }, searchText)

    console.log(`🔎 Found ${matches.length} matches for "${searchText}":`, matches)
  }

  private async handleDebugScreenshot(step: any): Promise<void> {
    const filename = step.filename || `debug-${Date.now()}.png`
    const fullPage = step.fullPage !== false // Default true

    await this.page.screenshot({
      path: `test-results/${filename}`,
      fullPage
    })

    console.log(`📸 Debug screenshot saved: test-results/${filename}`)
  }

  private async handleInspectPageStructure(step: any): Promise<void> {
    const structure = await this.page.evaluate(() => {
      function analyzeElement(el: Element, depth = 0): any {
        if (depth > 3) return null // Max depth 3

        const children = Array.from(el.children)
          .map(child => analyzeElement(child, depth + 1))
          .filter(Boolean)

        return {
          tag: el.tagName.toLowerCase(),
          id: el.id || undefined,
          class: el.className || undefined,
          text: el.textContent?.trim().substring(0, 50),
          children: children.length > 0 ? children : undefined
        }
      }

      return analyzeElement(document.body)
    })

    console.log('🏗️  Page Structure:', JSON.stringify(structure, null, 2))
  }

  private async handleWaitForElement(step: any): Promise<void> {
    const selector = step.selector as string
    const timeout = step.timeout || 10000
    const state = step.state || 'visible' // 'attached', 'visible', 'hidden'

    try {
      await this.page.locator(selector).waitFor({ state: state as any, timeout })
      console.log(`✅ Element found: ${selector}`)
    } catch (error) {
      console.log(`❌ Element not found: ${selector}`)

      // Auto-debug on failure
      await this.page.screenshot({
        path: `test-results/failed-wait-${Date.now()}.png`,
        fullPage: true
      })

      // Show similar elements
      const allElements = await this.page.evaluate((sel) => {
        const parts = sel.split(/[\s>+~]/).filter(Boolean)
        const results: string[] = []

        parts.forEach(part => {
          if (part.startsWith('.')) {
            const className = part.substring(1)
            const elements = document.querySelectorAll(`[class*="${className}"]`)
            elements.forEach(el => results.push(el.className))
          } else if (part.startsWith('#')) {
            const id = part.substring(1)
            const elements = document.querySelectorAll(`[id*="${id}"]`)
            elements.forEach(el => results.push(el.id))
          }
        })

        return [...new Set(results)].slice(0, 10)
      }, selector)

      console.log('🔍 Similar elements found:', allElements)
      throw error
    }
  }

  private async handleRetry(step: any): Promise<void> {
    const steps = step.steps as TestStep[]
    const maxAttempts = step.maxAttempts || 3
    const delayMs = step.delay || 1000

    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔄 Retry attempt ${attempt}/${maxAttempts}`)

        for (const subStep of steps) {
          await this.executeStep(subStep)
        }

        console.log(`✅ Retry succeeded on attempt ${attempt}`)
        return
      } catch (error) {
        lastError = error as Error
        console.log(`❌ Attempt ${attempt} failed:`, error)

        if (attempt < maxAttempts) {
          await this.page.waitForTimeout(delayMs)
        }
      }
    }

    throw new Error(`Retry failed after ${maxAttempts} attempts: ${lastError?.message}`)
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
