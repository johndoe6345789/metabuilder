import { describe, expect, it } from 'vitest'
import { generatePlaywrightTests } from './generatePlaywrightTests'
import type { PlaywrightTest } from '@/types/project'

describe('generatePlaywrightTests', () => {
  it('returns a placeholder test when array is empty', () => {
    const result = generatePlaywrightTests([])
    expect(result).toContain("import { test, expect } from '@playwright/test'")
    expect(result).toContain("test('example test'")
    expect(result).toContain('page.goto')
  })

  it('generates a test suite with navigate action', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Home page loads',
        description: '',
        pageUrl: 'http://localhost:3000',
        steps: [{ id: 's1', action: 'navigate' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("test.describe('Home page loads'")
    expect(result).toContain("page.goto('http://localhost:3000')")
  })

  it('generates click action', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Click test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'click', selector: '#submit-btn' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("page.click('#submit-btn')")
  })

  it('generates fill action with value', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Fill test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'fill', selector: '#email', value: 'test@example.com' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("page.fill('#email', 'test@example.com')")
  })

  it('generates expect action with assertion', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Assert test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'expect', selector: 'h1', assertion: 'toBeVisible()' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("expect(page.locator('h1')).toBeVisible()")
  })

  it('generates wait action with timeout', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Wait test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'wait', timeout: 2000 }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain('page.waitForTimeout(2000)')
  })

  it('generates wait action with default timeout when not specified', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Wait test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'wait' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain('page.waitForTimeout(1000)')
  })

  it('generates select action', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Select test',
        description: '',
        pageUrl: '/',
        steps: [{ id: 's1', action: 'select', selector: '#color', value: 'blue' }],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("page.selectOption('#color', 'blue')")
  })

  it('generates check and uncheck actions', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Checkbox test',
        description: '',
        pageUrl: '/',
        steps: [
          { id: 's1', action: 'check', selector: '#agree' },
          { id: 's2', action: 'uncheck', selector: '#agree' },
        ],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("page.check('#agree')")
    expect(result).toContain("page.uncheck('#agree')")
  })

  it('includes suite description comment when provided', () => {
    const tests: PlaywrightTest[] = [
      {
        id: 't1',
        name: 'Suite',
        description: 'This is the description',
        pageUrl: '/',
        steps: [],
      },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain('// This is the description')
  })

  it('handles multiple test suites', () => {
    const tests: PlaywrightTest[] = [
      { id: 't1', name: 'Suite A', description: '', pageUrl: '/a', steps: [] },
      { id: 't2', name: 'Suite B', description: '', pageUrl: '/b', steps: [] },
    ]
    const result = generatePlaywrightTests(tests)
    expect(result).toContain("test.describe('Suite A'")
    expect(result).toContain("test.describe('Suite B'")
  })
})
