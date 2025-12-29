import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { LuaEngine, createLuaEngine, type LuaExecutionContext } from '../lua-engine'

describe('lua-engine execution', () => {
  let engine: LuaEngine

  beforeEach(() => {
    engine = createLuaEngine()
  })

  afterEach(() => {
    engine.destroy()
  })

  describe('createLuaEngine', () => {
    it('should create a new LuaEngine instance', () => {
      const newEngine = createLuaEngine()
      expect(newEngine).toBeInstanceOf(LuaEngine)
      newEngine.destroy()
    })
  })

  describe('execute', () => {
    describe('basic operations', () => {
      it.each([
        { name: 'return number', code: 'return 42', expected: 42 },
        { name: 'return string', code: 'return "hello"', expected: 'hello' },
        { name: 'return boolean true', code: 'return true', expected: true },
        { name: 'return boolean false', code: 'return false', expected: false },
        { name: 'return nil', code: 'return nil', expected: null },
        { name: 'arithmetic', code: 'return 10 + 5 * 2', expected: 20 },
        {
          name: 'string concatenation',
          code: 'return "hello" .. " " .. "world"',
          expected: 'hello world',
        },
        { name: 'comparison', code: 'return 5 > 3', expected: true },
      ])('should execute $name', async ({ code, expected }) => {
        const result = await engine.execute(code)
        expect(result.success).toBe(true)
        expect(result.result).toBe(expected)
        expect(result.error).toBeUndefined()
      })
    })

    describe('table handling', () => {
      it.each([
        {
          name: 'array-like table returns object with numeric keys',
          code: 'return {1, 2, 3, 4, 5}',
          // Note: Lua tables with numeric keys are returned as objects with string keys
          // This is a known limitation of the current implementation
          expected: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
        },
        {
          name: 'object-like table',
          code: 'return {name = "Alice", age = 30}',
          expected: { name: 'Alice', age: 30 },
        },
        {
          name: 'nested table',
          code: 'return {user = {name = "Bob"}, count = 1}',
          expected: { user: { name: 'Bob' }, count: 1 },
        },
        {
          name: 'mixed table with nested numeric keys',
          code: 'return {items = {1, 2, 3}, total = 6}',
          // Nested array-like tables also become objects with numeric string keys
          expected: { items: { '1': 1, '2': 2, '3': 3 }, total: 6 },
        },
        {
          name: 'empty table',
          code: 'return {}',
          expected: {},
        },
      ])('should handle $name', async ({ code, expected }) => {
        const result = await engine.execute(code)
        expect(result.success).toBe(true)
        expect(result.result).toEqual(expected)
      })
    })

    describe('context data', () => {
      it.each([
        {
          name: 'access context.data number',
          code: 'return context.data.value * 2',
          context: { data: { value: 21 } } satisfies LuaExecutionContext,
          expected: 42,
        },
        {
          name: 'access context.data string',
          code: 'return context.data.name',
          context: { data: { name: 'test' } } satisfies LuaExecutionContext,
          expected: 'test',
        },
        {
          name: 'access context.data boolean',
          code: 'return context.data.active',
          context: { data: { active: true } } satisfies LuaExecutionContext,
          expected: true,
        },
        {
          name: 'access nested context.data',
          code: 'return context.data.user.name',
          context: { data: { user: { name: 'Alice' } } } satisfies LuaExecutionContext,
          expected: 'Alice',
        },
        {
          name: 'access context.data array',
          code: 'return context.data.items[2]',
          context: { data: { items: [10, 20, 30] } } satisfies LuaExecutionContext,
          expected: 20,
        },
      ])('should $name', async ({ code, context, expected }) => {
        const result = await engine.execute(code, context)
        expect(result.success).toBe(true)
        expect(result.result).toBe(expected)
      })

      it('should access context.user', async () => {
        const result = await engine.execute('return context.user.id', {
          user: { id: 'user123', name: 'Test' },
        })
        expect(result.success).toBe(true)
        expect(result.result).toBe('user123')
      })
    })

    describe('functions', () => {
      it.each([
        {
          name: 'simple function',
          code: `
            function add(a, b)
              return a + b
            end
            return add(3, 4)
          `,
          expected: 7,
        },
        {
          name: 'recursive function',
          code: `
            function factorial(n)
              if n <= 1 then return 1 end
              return n * factorial(n - 1)
            end
            return factorial(5)
          `,
          expected: 120,
        },
        {
          name: 'higher-order function',
          code: `
            function apply(f, x)
              return f(x)
            end
            function double(n)
              return n * 2
            end
            return apply(double, 10)
          `,
          expected: 20,
        },
        {
          name: 'closure',
          code: `
            function counter()
              local count = 0
              return function()
                count = count + 1
                return count
              end
            end
            local c = counter()
            c()
            c()
            return c()
          `,
          expected: 3,
        },
      ])('should execute $name', async ({ code, expected }) => {
        const result = await engine.execute(code)
        expect(result.success).toBe(true)
        expect(result.result).toBe(expected)
      })
    })

    describe('control flow', () => {
      it.each([
        {
          name: 'if-then-else true branch',
          code: `
            local x = 10
            if x > 5 then
              return "big"
            else
              return "small"
            end
          `,
          expected: 'big',
        },
        {
          name: 'if-then-else false branch',
          code: `
            local x = 3
            if x > 5 then
              return "big"
            else
              return "small"
            end
          `,
          expected: 'small',
        },
        {
          name: 'for loop',
          code: `
            local sum = 0
            for i = 1, 5 do
              sum = sum + i
            end
            return sum
          `,
          expected: 15,
        },
        {
          name: 'while loop',
          code: `
            local count = 0
            local n = 10
            while n > 0 do
              count = count + 1
              n = n - 2
            end
            return count
          `,
          expected: 5,
        },
      ])('should execute $name', async ({ code, expected }) => {
        const result = await engine.execute(code)
        expect(result.success).toBe(true)
        expect(result.result).toBe(expected)
      })
    })

    describe('multiple return values', () => {
      it('should handle multiple return values', async () => {
        const result = await engine.execute('return 1, 2, 3')
        expect(result.success).toBe(true)
        expect(result.result).toEqual([1, 2, 3])
      })

      it('should handle function with multiple returns', async () => {
        const result = await engine.execute(`
          function swap(a, b)
            return b, a
          end
          return swap(1, 2)
        `)
        expect(result.success).toBe(true)
        expect(result.result).toEqual([2, 1])
      })
    })

    describe('no return value', () => {
      it('should handle code with no return', async () => {
        const result = await engine.execute('local x = 1 + 1')
        expect(result.success).toBe(true)
        expect(result.result).toBeNull()
      })
    })

    describe('standard library', () => {
      it.each([
        { name: 'math.floor', code: 'return math.floor(3.7)', expected: 3 },
        { name: 'math.ceil', code: 'return math.ceil(3.2)', expected: 4 },
        { name: 'math.abs', code: 'return math.abs(-5)', expected: 5 },
        { name: 'math.max', code: 'return math.max(1, 5, 3)', expected: 5 },
        { name: 'math.min', code: 'return math.min(1, 5, 3)', expected: 1 },
        { name: 'string.upper', code: 'return string.upper("hello")', expected: 'HELLO' },
        { name: 'string.lower', code: 'return string.lower("HELLO")', expected: 'hello' },
        { name: 'string.len', code: 'return string.len("test")', expected: 4 },
        { name: 'string.sub', code: 'return string.sub("hello", 2, 4)', expected: 'ell' },
        {
          name: 'table.concat',
          code: 'return table.concat({"a", "b", "c"}, ", ")',
          expected: 'a, b, c',
        },
      ])('should support $name', async ({ code, expected }) => {
        const result = await engine.execute(code)
        expect(result.success).toBe(true)
        expect(result.result).toBe(expected)
      })
    })
  })

  describe('destroy', () => {
    it('should cleanup without error', () => {
      const testEngine = createLuaEngine()
      expect(() => testEngine.destroy()).not.toThrow()
    })
  })
})
