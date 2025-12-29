import { beforeEach, describe, expect, it } from 'vitest'
import { DeclarativeComponentRenderer } from '@/lib/rendering/declarative-component-renderer'

describe('declarative-component-renderer lua integration', () => {
  let renderer: DeclarativeComponentRenderer

  beforeEach(() => {
    renderer = new DeclarativeComponentRenderer()
  })

  describe('registerLuaScript', () => {
    it('should register and store Lua scripts', async () => {
      const script = {
        code: 'return x + y',
        parameters: [{ name: 'x' }, { name: 'y' }],
        returnType: 'number',
      }
      renderer.registerLuaScript('add', script)

      await expect(renderer.executeLuaScript('add', [1, 2])).resolves.toBeDefined()
    })
  })

  describe('executeLuaScript', () => {
    it('should throw error for non-existent script', async () => {
      await expect(renderer.executeLuaScript('nonexistent', [])).rejects.toThrow(
        'Lua script not found: nonexistent'
      )
    })

    it('should execute script with parameters', async () => {
      renderer.registerLuaScript('testScript', {
        code: `
function formatTime(timestamp)
  return timestamp * 1000
end
`,
        parameters: [{ name: 'timestamp' }],
        returnType: 'number',
      })

      const result = await renderer.executeLuaScript('testScript', [5])
      expect(result).toBe(5000)
    })

    it('should handle script with no parameters', async () => {
      renderer.registerLuaScript('constantScript', {
        code: `
function formatTime()
  return 42
end
`,
        parameters: [],
        returnType: 'number',
      })

      const result = await renderer.executeLuaScript('constantScript', [])
      expect(result).toBe(42)
    })
  })
})
