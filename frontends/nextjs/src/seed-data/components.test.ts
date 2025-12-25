import { describe, it, expect, beforeEach, vi } from 'vitest'

const { getComponentConfigs, addComponentConfig } = vi.hoisted(() => ({
  getComponentConfigs: vi.fn(),
  addComponentConfig: vi.fn(),
}))

vi.mock('@/lib/database', () => ({
  Database: {
    getComponentConfigs,
    addComponentConfig,
  },
}))

import { initializeComponents } from '@/seed-data/components'

const expectedConfigs = [
  {
    id: 'config_home_heading',
    componentId: 'node_home_heading',
    props: {
      level: 1,
      children: 'Welcome to MetaBuilder',
    },
  },
  {
    id: 'config_home_subtitle',
    componentId: 'node_home_subtitle',
    props: {
      children: 'Build multi-tenant applications without writing code',
    },
  },
  {
    id: 'config_home_button',
    componentId: 'node_home_button',
    props: {
      children: 'Get Started',
      variant: 'default',
      size: 'lg',
    },
  },
]

describe('initializeComponents', () => {
  beforeEach(() => {
    getComponentConfigs.mockReset()
    addComponentConfig.mockReset()
  })

  it.each([
    {
      name: 'skip seeding when configs exist',
      existingConfigs: { existing: { id: 'existing' } },
      expectedAddCount: 0,
    },
    {
      name: 'seed defaults when no configs exist',
      existingConfigs: {},
      expectedAddCount: expectedConfigs.length,
    },
  ])('should $name', async ({ existingConfigs, expectedAddCount }) => {
    getComponentConfigs.mockResolvedValue(existingConfigs)

    await initializeComponents()

    expect(getComponentConfigs).toHaveBeenCalledTimes(1)
    expect(addComponentConfig).toHaveBeenCalledTimes(expectedAddCount)

    if (expectedAddCount > 0) {
      expectedConfigs.forEach(config => {
        expect(addComponentConfig).toHaveBeenCalledWith(expect.objectContaining(config))
      })
    }
  })
})
