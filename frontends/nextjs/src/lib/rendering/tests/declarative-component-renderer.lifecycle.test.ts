import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DeclarativeComponentRenderer,
  getDeclarativeRenderer,
  loadPackageComponents,
  type DeclarativeComponentConfig,
} from '@/lib/rendering/declarative-component-renderer'

describe('declarative-component-renderer lifecycle', () => {
  let renderer: DeclarativeComponentRenderer

  beforeEach(() => {
    renderer = new DeclarativeComponentRenderer()
  })

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
      const luaExecuteSpy = vi.spyOn(
        DeclarativeComponentRenderer.prototype as any,
        'executeLuaScript'
      )

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

      expect(luaExecuteSpy).not.toHaveBeenCalled()
    })

    it('should handle empty package content', () => {
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
