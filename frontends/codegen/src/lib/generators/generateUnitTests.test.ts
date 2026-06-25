import { describe, expect, it } from 'vitest'
import { generateUnitTests } from './generateUnitTests'
import type { UnitTest } from '@/types/project'

function makeTest(overrides: Partial<UnitTest> = {}): UnitTest {
  return {
    id: 'ut1',
    name: 'My Suite',
    description: '',
    testType: 'function',
    targetFile: '',
    testCases: [],
    ...overrides,
  }
}

describe('generateUnitTests', () => {
  it('returns empty object for empty array', () => {
    expect(generateUnitTests([])).toEqual({})
  })

  it('generates a function test file with vitest imports', () => {
    const tests = [makeTest({ name: 'Utils', testType: 'function', targetFile: 'src/utils/math.ts' })]
    const result = generateUnitTests(tests)
    const key = Object.keys(result)[0]
    expect(key).toContain('math.test')
    expect(result[key]).toContain("import { describe, it, expect } from 'vitest'")
    expect(result[key]).toContain("describe('Utils'")
  })

  it('generates a component test file with testing-library imports', () => {
    const tests = [
      makeTest({
        name: 'Button tests',
        testType: 'component',
        targetFile: 'src/components/Button.tsx',
      }),
    ]
    const result = generateUnitTests(tests)
    const key = Object.keys(result)[0]
    const code = result[key]
    expect(code).toContain("import { render, screen } from '@testing-library/react'")
    expect(code).toContain("import { Button } from 'src/components/Button'")
  })

  it('generates a hook test file with renderHook import', () => {
    const tests = [
      makeTest({
        name: 'Hook tests',
        testType: 'hook',
        targetFile: 'src/hooks/use-foo.ts',
      }),
    ]
    const result = generateUnitTests(tests)
    const key = Object.keys(result)[0]
    const code = result[key]
    expect(code).toContain("import { renderHook } from '@testing-library/react'")
    expect(code).toContain("import { use-foo } from 'src/hooks/use-foo'")
  })

  it('uses default path when no targetFile is given', () => {
    const tests = [makeTest({ name: 'Generic Suite', testType: 'function', targetFile: '' })]
    const result = generateUnitTests(tests)
    const key = Object.keys(result)[0]
    expect(key).toBe('src/__tests__/GenericSuite.test.tsx')
  })

  it('renders test cases with assertions', () => {
    const tests = [
      makeTest({
        name: 'Math',
        testType: 'function',
        targetFile: '',
        testCases: [
          {
            id: 'tc1',
            description: 'adds two numbers',
            assertions: ['expect(add(1,2)).toBe(3)'],
          },
        ],
      }),
    ]
    const result = generateUnitTests(tests)
    const code = Object.values(result)[0]
    expect(code).toContain("it('adds two numbers'")
    expect(code).toContain('expect(add(1,2)).toBe(3)')
  })

  it('renders setup and teardown in test cases', () => {
    const tests = [
      makeTest({
        name: 'Suite',
        testType: 'function',
        targetFile: '',
        testCases: [
          {
            id: 'tc1',
            description: 'with setup',
            assertions: ['expect(true).toBe(true)'],
            setup: 'const x = 1',
            teardown: 'cleanup()',
          },
        ],
      }),
    ]
    const result = generateUnitTests(tests)
    const code = Object.values(result)[0]
    expect(code).toContain('const x = 1')
    expect(code).toContain('cleanup()')
  })

  it('includes suite description as comment', () => {
    const tests = [makeTest({ name: 'Suite', description: 'This is a test suite', testType: 'function', targetFile: '' })]
    const result = generateUnitTests(tests)
    const code = Object.values(result)[0]
    expect(code).toContain('// This is a test suite')
  })
})
