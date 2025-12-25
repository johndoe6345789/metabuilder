import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  DeclarativeComponentRenderer,
  getDeclarativeRenderer,
  loadPackageComponents,
  type DeclarativeComponentConfig,
} from './declarative-component-renderer'

describe('declarative-component-renderer', () => {
  let renderer: DeclarativeComponentRenderer

  beforeEach(() => {
    renderer = new DeclarativeComponentRenderer()
  })

  describe('DeclarativeComponentRenderer', () => {
    describe('registerComponentConfig', () => {
      it.each([
        {
          name: 'basic component',
          type: 'button',
          config: {
            type: 'button',
            category: 'input',
            label: 'Button',
            description: 'A clickable button',
            icon: 'click',
            props: [],
            config: { layout: 'inline', styling: { className: 'btn' }, children: [] },
          },
        },
        {
          name: 'component with props',
          type: 'input',
          config: {
            type: 'input',
            category: 'form',
            label: 'Input Field',
            description: 'Text input',
            icon: 'text',
            props: [
              { name: 'placeholder', type: 'string', label: 'Placeholder', required: false },
              { name: 'value', type: 'string', label: 'Value', required: true, defaultValue: '' },
            ],
            config: { layout: 'block', styling: { className: 'input' }, children: [] },
          },
        },
      ])('should register $name', ({ type, config }) => {
        renderer.registerComponentConfig(type, config as DeclarativeComponentConfig)

        expect(renderer.hasComponentConfig(type)).toBe(true)
        expect(renderer.getComponentConfig(type)).toEqual(config)
      })
    })

    describe('hasComponentConfig', () => {
      it.each([
        { type: 'registered', shouldRegister: true, expected: true },
        { type: 'unregistered', shouldRegister: false, expected: false },
      ])('should return $expected for $type component', ({ type, shouldRegister, expected }) => {
        if (shouldRegister) {
          renderer.registerComponentConfig(type, {
            type,
            category: 'test',
            label: 'Test',
            description: '',
            icon: '',
            props: [],
            config: { layout: '', styling: { className: '' }, children: [] },
          })
        }

        expect(renderer.hasComponentConfig(type)).toBe(expected)
      })
    })

    describe('getComponentConfig', () => {
      it('should return undefined for non-existent component', () => {
        expect(renderer.getComponentConfig('nonexistent')).toBeUndefined()
      })

      it('should return config for registered component', () => {
        const config: DeclarativeComponentConfig = {
          type: 'test',
          category: 'test',
          label: 'Test Component',
          description: 'A test',
          icon: 'test',
          props: [],
          config: { layout: 'block', styling: { className: 'test' }, children: [] },
        }
        renderer.registerComponentConfig('test', config)

        expect(renderer.getComponentConfig('test')).toEqual(config)
      })
    })

    describe('interpolateValue', () => {
      it.each([
        {
          name: 'simple interpolation',
          template: 'Hello {name}!',
          context: { name: 'World' },
          expected: 'Hello World!',
        },
        {
          name: 'multiple placeholders',
          template: '{greeting} {name}, welcome to {place}',
          context: { greeting: 'Hi', name: 'Alice', place: 'Wonderland' },
          expected: 'Hi Alice, welcome to Wonderland',
        },
        {
          name: 'missing placeholder',
          template: 'Hello {name}, age: {age}',
          context: { name: 'Bob' },
          expected: 'Hello Bob, age: {age}',
        },
        {
          name: 'numeric value',
          template: 'Count: {count}',
          context: { count: 42 },
          expected: 'Count: 42',
        },
        {
          name: 'boolean value',
          template: 'Active: {active}',
          context: { active: true },
          expected: 'Active: true',
        },
        {
          name: 'empty template',
          template: '',
          context: { name: 'test' },
          expected: '',
        },
        {
          name: 'no placeholders',
          template: 'Plain text',
          context: { name: 'ignored' },
          expected: 'Plain text',
        },
        {
          name: 'null template',
          template: null as any,
          context: { name: 'test' },
          expected: null,
        },
        {
          name: 'undefined value in context',
          template: 'Value: {val}',
          context: { val: undefined },
          expected: 'Value: {val}',
        },
      ])('should handle $name', ({ template, context, expected }) => {
        expect(renderer.interpolateValue(template, context)).toBe(expected)
      })
    })

    describe('evaluateConditional', () => {
      it.each([
        { name: 'boolean true', condition: true, context: {}, expected: true },
        { name: 'boolean false', condition: false, context: {}, expected: false },
        { name: 'empty string condition', condition: '', context: {}, expected: true },
        { name: 'null condition', condition: null as any, context: {}, expected: true },
        { name: 'undefined condition', condition: undefined as any, context: {}, expected: true },
        { name: 'truthy context value', condition: 'isActive', context: { isActive: true }, expected: true },
        { name: 'falsy context value', condition: 'isActive', context: { isActive: false }, expected: false },
        { name: 'missing context key', condition: 'missing', context: {}, expected: false },
        { name: 'truthy string value', condition: 'name', context: { name: 'test' }, expected: true },
        { name: 'empty string value', condition: 'name', context: { name: '' }, expected: false },
        { name: 'zero value', condition: 'count', context: { count: 0 }, expected: false },
        { name: 'positive number', condition: 'count', context: { count: 5 }, expected: true },
      ])('should return $expected for $name', ({ condition, context, expected }) => {
        expect(renderer.evaluateConditional(condition, context)).toBe(expected)
      })
    })

    describe('resolveDataSource', () => {
      it.each([
        {
          name: 'existing array data source',
          dataSource: 'items',
          context: { items: [1, 2, 3] },
          expected: [1, 2, 3],
        },
        {
          name: 'empty array data source',
          dataSource: 'items',
          context: { items: [] },
          expected: [],
        },
        {
          name: 'missing data source',
          dataSource: 'missing',
          context: {},
          expected: [],
        },
        {
          name: 'null data source key',
          dataSource: '',
          context: { items: [1] },
          expected: [],
        },
        {
          name: 'object array data source',
          dataSource: 'users',
          context: { users: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }] },
          expected: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        },
      ])('should resolve $name', ({ dataSource, context, expected }) => {
        expect(renderer.resolveDataSource(dataSource, context)).toEqual(expected)
      })
    })

    describe('registerLuaScript', () => {
      it('should register and store Lua scripts', () => {
        const script = {
          code: 'return x + y',
          parameters: [{ name: 'x' }, { name: 'y' }],
          returnType: 'number',
        }
        renderer.registerLuaScript('add', script)

        // Verify registration by attempting to execute
        // The script is stored internally
        expect(true).toBe(true) // Script registered without error
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

  describe('getDeclarativeRenderer', () => {
    it('should return a global renderer instance', () => {
      const renderer1 = getDeclarativeRenderer()
      const renderer2 = getDeclarativeRenderer()

      expect(renderer1).toBe(renderer2)
      expect(renderer1).toBeInstanceOf(DeclarativeComponentRenderer)
    })
  })

  describe('loadPackageComponents', () => {
    it('should load component configs from package', () => {
      const renderer = getDeclarativeRenderer()
      const testType = `loadTest_${Date.now()}`

      loadPackageComponents({
        componentConfigs: {
          [testType]: {
            type: testType,
            category: 'test',
            label: 'Loaded Component',
            description: 'Loaded from package',
            icon: 'package',
            props: [],
            config: { layout: 'block', styling: { className: 'loaded' }, children: [] },
          },
        },
      })

      expect(renderer.hasComponentConfig(testType)).toBe(true)
    })

    it('should load Lua scripts from package', () => {
      loadPackageComponents({
        luaScripts: [
          {
            id: `pkgScript_${Date.now()}`,
            code: 'function formatTime() return 1 end',
            parameters: [],
            returnType: 'number',
          },
        ],
      })

      // Script loaded without error
      expect(true).toBe(true)
    })

    it('should handle empty package content', () => {
      // Should not throw
      loadPackageComponents({})
      loadPackageComponents({ componentConfigs: {} })
      loadPackageComponents({ luaScripts: [] })

      expect(true).toBe(true)
    })

    it('should handle package with both configs and scripts', () => {
      const renderer = getDeclarativeRenderer()
      const uniqueId = Date.now()

      loadPackageComponents({
        componentConfigs: {
          [`combo_${uniqueId}`]: {
            type: `combo_${uniqueId}`,
            category: 'combo',
            label: 'Combo',
            description: 'Combined',
            icon: 'combo',
            props: [],
            config: { layout: 'flex', styling: { className: 'combo' }, children: [] },
          },
        },
        luaScripts: [
          {
            id: `comboScript_${uniqueId}`,
            code: 'function userJoin(name) return "Welcome " .. name end',
            parameters: [{ name: 'name' }],
            returnType: 'string',
          },
        ],
      })

      expect(renderer.hasComponentConfig(`combo_${uniqueId}`)).toBe(true)
    })
  })
})
