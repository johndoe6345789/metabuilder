import { beforeEach, describe, expect, it, vi } from 'vitest'

import { componentCatalog } from '@/lib/component-catalog'
import type { ComponentTypeDefinition } from '@/lib/component-registry'
import { ComponentRegistry } from '@/lib/component-registry'

const buildComponent = (
  type: string,
  category: ComponentTypeDefinition['category']
): ComponentTypeDefinition => ({
  type,
  label: `${type} Label`,
  icon: 'TestIcon',
  category,
  defaultProps: {},
  propSchema: [],
  allowsChildren: false,
})

describe('ComponentRegistry', () => {
  let registry: ComponentRegistry

  beforeEach(() => {
    registry = new ComponentRegistry()
  })

  it.each([{ type: 'Container' }, { type: 'Button' }, { type: 'Heading' }])(
    'should load catalog component $type',
    ({ type }) => {
      expect(registry.hasComponent(type)).toBe(true)
      expect(registry.getComponent(type)).toBeDefined()
    }
  )

  it('should return undefined for unknown component', () => {
    expect(registry.getComponent('MissingComponent')).toBeUndefined()
    expect(registry.hasComponent('MissingComponent')).toBe(false)
  })

  it('should register a custom component', () => {
    const custom = buildComponent('CustomWidget', 'Data')
    registry.registerComponent(custom)

    expect(registry.getComponent('CustomWidget')).toBe(custom)
    expect(registry.hasComponent('CustomWidget')).toBe(true)
  })

  it('should register multiple components', () => {
    const components = [buildComponent('Alpha', 'Layout'), buildComponent('Beta', 'Feedback')]

    registry.registerComponents(components)

    components.forEach(component => {
      expect(registry.getComponent(component.type)).toBe(component)
    })
  })

  it('should filter components by category', () => {
    const custom = buildComponent('Chart', 'Data')
    registry.registerComponent(custom)

    const results = registry.getComponentsByCategory('Data')
    const types = results.map(component => component.type)

    expect(types).toContain('Chart')
  })

  it('should expose all unique catalog components', () => {
    const uniqueTypes = new Set(componentCatalog.map(component => component.type))
    expect(registry.getAllComponents()).toHaveLength(uniqueTypes.size)
  })
})

describe('component registry helpers', () => {
  it('should return a singleton registry instance', async () => {
    vi.resetModules()
    const module = await import('@/lib/component-registry')

    const first = module.getComponentRegistry()
    const second = module.getComponentRegistry()

    expect(first).toBe(second)
  })

  it('should initialize the registry without errors', async () => {
    vi.resetModules()
    const module = await import('@/lib/component-registry')

    await expect(module.initializeComponentRegistry()).resolves.toBeUndefined()
    expect(module.getComponentRegistry().getAllComponents().length).toBeGreaterThan(0)
  })
})
