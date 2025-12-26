import { describe, it, expect, beforeEach, vi } from 'vitest'

const {
  initializeUsers,
  initializeComponents,
  initializeScripts,
  initializeWorkflows,
  initializePages,
  initializePackages,
} = vi.hoisted(() => ({
  initializeUsers: vi.fn(),
  initializeComponents: vi.fn(),
  initializeScripts: vi.fn(),
  initializeWorkflows: vi.fn(),
  initializePages: vi.fn(),
  initializePackages: vi.fn(),
}))

vi.mock('./users', () => ({ initializeUsers }))
vi.mock('./components', () => ({ initializeComponents }))
vi.mock('./scripts', () => ({ initializeScripts }))
vi.mock('./workflows', () => ({ initializeWorkflows }))
vi.mock('./pages', () => ({ initializePages }))
vi.mock('./packages', () => ({ initializePackages }))

import { initializeAllSeedData } from './index'

describe('initializeAllSeedData', () => {
  beforeEach(() => {
    initializeUsers.mockReset()
    initializeComponents.mockReset()
    initializeScripts.mockReset()
    initializeWorkflows.mockReset()
    initializePages.mockReset()
    initializePackages.mockReset()
  })

  it.each([
    {
      name: 'run seeders in order',
      errorStep: null as string | null,
      expectedCalls: ['users', 'components', 'scripts', 'workflows', 'pages', 'packages'],
    },
    {
      name: 'stop when a seeder fails',
      errorStep: 'scripts',
      expectedCalls: ['users', 'components', 'scripts'],
    },
  ])('should $name', async ({ errorStep, expectedCalls }) => {
    const callOrder: string[] = []
    initializeUsers.mockImplementation(async () => callOrder.push('users'))
    initializeComponents.mockImplementation(async () => callOrder.push('components'))
    initializeScripts.mockImplementation(async () => {
      callOrder.push('scripts')
      if (errorStep === 'scripts') {
        throw new Error('seed failed')
      }
    })
    initializeWorkflows.mockImplementation(async () => callOrder.push('workflows'))
    initializePages.mockImplementation(async () => callOrder.push('pages'))
    initializePackages.mockImplementation(async () => callOrder.push('packages'))

    if (errorStep) {
      await expect(initializeAllSeedData()).rejects.toThrow('seed failed')
    } else {
      await expect(initializeAllSeedData()).resolves.toBeUndefined()
    }

    expect(callOrder).toEqual(expectedCalls)
  })
})
