import { afterEach,beforeEach, describe, expect, it } from 'vitest'

import { createLuaEngine,LuaEngine } from '../lua-engine'

describe('lua-engine events', () => {
  let engine: LuaEngine

  beforeEach(() => {
    engine = createLuaEngine()
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('logging', () => {
    it('should capture log() calls', async () => {
      const result = await engine.execute(`
        log("message 1")
        log("message 2")
        return "done"
      `)
      expect(result.success).toBe(true)
      expect(result.logs).toContain('message 1')
      expect(result.logs).toContain('message 2')
    })

    it('should capture print() calls', async () => {
      const result = await engine.execute(`
        print("printed output")
        return true
      `)
      expect(result.success).toBe(true)
      expect(result.logs).toContain('printed output')
    })

    it.each([
      { name: 'number', code: 'log(42)', expected: '42' },
      { name: 'boolean', code: 'log(true)', expected: 'true' },
      { name: 'multiple args', code: 'log("a", "b", "c")', expected: 'a b c' },
    ])('should log $name correctly', async ({ code, expected }) => {
      const result = await engine.execute(code)
      expect(result.logs).toContain(expected)
    })
  })

  describe('error handling', () => {
    it.each([
      {
        name: 'syntax error',
        code: 'this is not valid lua !!!',
        errorContains: 'Syntax error',
      },
      {
        name: 'undefined variable',
        code: 'return undefinedVar.property',
        errorContains: 'Runtime error',
      },
      {
        name: 'type error',
        code: 'return "string" + 5',
        errorContains: 'error',
      },
      {
        name: 'explicit error',
        code: 'error("intentional error")',
        errorContains: 'intentional error',
      },
    ])('should handle $name', async ({ code, errorContains }) => {
      const result = await engine.execute(code)
      expect(result.success).toBe(false)
      expect(result.error?.toLowerCase()).toContain(errorContains.toLowerCase())
    })
  })
})
