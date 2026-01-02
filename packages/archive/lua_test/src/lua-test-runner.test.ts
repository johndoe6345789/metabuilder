/**
 * Tests for the Lua Test Runner integration
 */

import { describe, expect, it } from 'vitest'

import { generateTestRunnerCode } from './lua-test-runner'

describe('lua-test-runner', () => {
  describe('generateTestRunnerCode', () => {
    it('should generate valid Lua code', () => {
      const testCode = `
describe("math", function()
  it("should add numbers", function()
    expect(1 + 1).toBe(2)
  end)
end)
`
      const code = generateTestRunnerCode(testCode)

      expect(code).toContain('local framework')
      expect(code).toContain('local assertions')
      expect(code).toContain('local runner')
      expect(code).toContain('describe("math"')
      expect(code).toContain('runner.runAll')
    })

    it('should include config options', () => {
      const testCode = 'describe("test", function() end)'
      const config = {
        timeout: 10000,
        verbose: false,
        stopOnFirstFailure: true,
        filter: 'validation',
      }

      const code = generateTestRunnerCode(testCode, config)

      expect(code).toContain('"timeout":10000')
      expect(code).toContain('"stopOnFirstFailure":true')
      expect(code).toContain('"filter":"validation"')
    })

    it('should expose test DSL globals', () => {
      const testCode = ''
      const code = generateTestRunnerCode(testCode)

      expect(code).toContain('describe = framework.describe')
      expect(code).toContain('it = framework.it')
      expect(code).toContain('xit = framework.xit')
      expect(code).toContain('fit = framework.fit')
      expect(code).toContain('beforeAll = framework.beforeAll')
      expect(code).toContain('afterAll = framework.afterAll')
      expect(code).toContain('beforeEach = framework.beforeEach')
      expect(code).toContain('afterEach = framework.afterEach')
      expect(code).toContain('expect = assertions.expect')
      expect(code).toContain('mock = mocks')
    })

    it('should reset framework before running tests', () => {
      const testCode = ''
      const code = generateTestRunnerCode(testCode)

      expect(code).toContain('framework.reset()')
    })

    it('should return test results', () => {
      const testCode = ''
      const code = generateTestRunnerCode(testCode)

      expect(code).toContain('return results')
    })
  })

  describe('generated framework module', () => {
    it('should include describe function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.describe(name, fn)')
    })

    it('should include it function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.it(name, fn)')
    })

    it('should include lifecycle hooks', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.beforeAll(fn)')
      expect(code).toContain('function M.afterAll(fn)')
      expect(code).toContain('function M.beforeEach(fn)')
      expect(code).toContain('function M.afterEach(fn)')
    })
  })

  describe('generated assertions module', () => {
    it('should include expect function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.expect(actual)')
    })

    it('should include matchers', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function expectation.toBe(expected)')
      expect(code).toContain('function expectation.toEqual(expected)')
      expect(code).toContain('function expectation.toBeNil()')
      expect(code).toContain('function expectation.toBeTruthy()')
      expect(code).toContain('function expectation.toContain(expected)')
    })

    it('should include standalone assertions', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.assertTrue')
      expect(code).toContain('function M.assertFalse')
      expect(code).toContain('function M.assertEqual')
      expect(code).toContain('function M.assertNil')
    })
  })

  describe('generated mocks module', () => {
    it('should include mock.fn function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.fn(implementation)')
    })

    it('should include spyOn function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.spyOn(obj, methodName)')
    })
  })

  describe('generated runner module', () => {
    it('should include status constants', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('M.STATUS = { PASSED = "passed"')
    })

    it('should include runTest function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.runTest(test, hooks)')
    })

    it('should include runSuite function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.runSuite(suite, config, parentHooks)')
    })

    it('should include runAll function', () => {
      const code = generateTestRunnerCode('')

      expect(code).toContain('function M.runAll(suites, config)')
    })
  })
})
