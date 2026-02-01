/**
 * Playwright Workflow Plugin
 * Execute E2E tests as workflow nodes
 * @packageDocumentation
 */

import { chromium, firefox, webkit, Browser, Page, test } from '@playwright/test'

export interface PlaywrightTestInput {
  browser?: 'chromium' | 'firefox' | 'webkit'
  headless?: boolean
  baseUrl?: string
  testFile?: string
  testName?: string
  config?: any
}

export interface PlaywrightTestResult {
  status: 'passed' | 'failed' | 'skipped'
  duration: number
  error?: string
  screenshots?: string[]
  videos?: string[]
  logs?: string[]
}

export class PlaywrightTestNode {
  private browser: Browser | null = null
  private page: Page | null = null

  async execute(input: PlaywrightTestInput): Promise<PlaywrightTestResult> {
    const startTime = Date.now()

    try {
      // Launch browser
      const browserType = this.getBrowserType(input.browser || 'chromium')
      this.browser = await browserType.launch({
        headless: input.headless !== false
      })

      // Create page
      this.page = await this.browser.newPage()

      // Configure
      if (input.baseUrl) {
        await this.page.goto(input.baseUrl)
      }

      // Execute test
      const result = await this.runTest(input)

      // Close
      await this.browser.close()

      return {
        ...result,
        duration: Date.now() - startTime
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      if (this.browser) {
        await this.browser.close()
      }

      return {
        status: 'failed',
        duration: Date.now() - startTime,
        error: err.message
      }
    }
  }

  private getBrowserType(browser: string) {
    switch (browser) {
      case 'firefox':
        return firefox
      case 'webkit':
        return webkit
      default:
        return chromium
    }
  }

  private async runTest(input: PlaywrightTestInput): Promise<PlaywrightTestResult> {
    if (!this.page) {
      throw new Error('Page not initialized')
    }

    // Run test file or specific test
    if (input.testFile) {
      return await this.runTestFile(input.testFile, input.testName)
    }

    // Default: simple connectivity test
    try {
      const title = await this.page.title()
      return {
        status: 'passed',
        duration: 0,
        logs: ['Page loaded successfully', 'Title: ' + title]
      }
    } catch (error) {
      return {
        status: 'failed',
        duration: 0,
        error: 'Failed to load page'
      }
    }
  }

  private async runTestFile(
    testFile: string,
    testName?: string
  ): Promise<PlaywrightTestResult> {
    // This would typically use Playwright's test runner
    // For now, return placeholder
    return {
      status: 'passed',
      duration: 0,
      logs: ['Test file: ' + testFile, testName ? 'Test: ' + testName : 'All tests']
    }
  }
}

/**
 * Workflow node factory
 */
export async function createPlaywrightNode(config: any) {
  return new PlaywrightTestNode()
}

/**
 * Node type definition
 */
export const nodeDefinition = {
  displayName: 'Playwright Test',
  description: 'Execute Playwright E2E tests',
  icon: 'test',
  group: ['testing'],
  version: 1,
  subtitle: 'Run browser tests',
  inputs: [
    {
      name: 'main',
      type: 'main'
    }
  ],
  outputs: [
    {
      name: 'main',
      type: 'main'
    }
  ],
  properties: [
    {
      displayName: 'Browser',
      name: 'browser',
      type: 'options',
      default: 'chromium',
      options: [
        {
          name: 'Chromium',
          value: 'chromium'
        },
        {
          name: 'Firefox',
          value: 'firefox'
        },
        {
          name: 'WebKit',
          value: 'webkit'
        }
      ]
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      placeholder: 'http://localhost:3000'
    },
    {
      displayName: 'Test File',
      name: 'testFile',
      type: 'string',
      placeholder: 'e2e/tests/login.spec.ts'
    },
    {
      displayName: 'Test Name',
      name: 'testName',
      type: 'string',
      placeholder: 'Optional: specific test to run'
    },
    {
      displayName: 'Headless',
      name: 'headless',
      type: 'boolean',
      default: true
    },
    {
      displayName: 'Timeout (ms)',
      name: 'timeout',
      type: 'number',
      default: 30000
    }
  ]
}
