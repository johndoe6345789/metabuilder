/**
 * Mock Lua Engine for Storybook
 * 
 * Since fengari requires a real Lua VM, we mock the execution
 * by interpreting the JSON-like component trees that Lua packages produce.
 * This allows Storybook to render Lua packages without running actual Lua code.
 */

import type { LuaUIComponent } from '@/lib/lua/ui/types/lua-ui-package'
import type { JsonValue } from '@/types/utility-types'

export interface MockLuaContext {
  user?: {
    id: string
    username: string
    level: number
    email?: string
  }
  nerdMode?: boolean
  theme?: 'light' | 'dark'
  [key: string]: JsonValue | undefined
}

export interface MockLuaScript {
  id: string
  name: string
  code: string
  /**
   * Pre-computed output for this script given specific contexts.
   * Keys are JSON-stringified context objects.
   */
  mockOutputs?: Record<string, LuaUIComponent>
  /**
   * Default output to use when no matching mock is found
   */
  defaultOutput?: LuaUIComponent
}

export interface MockPackageManifest {
  id: string
  name: string
  version: string
  description: string
  category: string
  minLevel: number
  scripts: MockLuaScript[]
  /**
   * Pre-rendered component trees for different contexts
   */
  renderedPages?: Record<string, LuaUIComponent>
}

/**
 * Create a mock user context for Storybook stories
 */
export function createMockUser(overrides?: Partial<MockLuaContext['user']>): MockLuaContext['user'] {
  return {
    id: 'mock-user-1',
    username: 'storybook_user',
    level: 4,
    email: 'user@example.com',
    ...overrides,
  }
}

/**
 * Create a full mock context for Lua package rendering
 */
export function createMockContext(overrides?: Partial<MockLuaContext>): MockLuaContext {
  return {
    user: createMockUser(overrides?.user),
    nerdMode: false,
    theme: 'light',
    ...overrides,
  }
}

/**
 * Mock Lua execution result
 */
export interface MockLuaResult {
  success: boolean
  result?: LuaUIComponent
  error?: string
  logs: string[]
}

/**
 * Execute a mock Lua script with the given context
 * Returns pre-computed output based on the context
 */
export function executeMockLuaScript(
  script: MockLuaScript,
  context: MockLuaContext
): MockLuaResult {
  const contextKey = JSON.stringify(context)
  
  // Check for exact context match
  if (script.mockOutputs && script.mockOutputs[contextKey]) {
    return {
      success: true,
      result: script.mockOutputs[contextKey],
      logs: [],
    }
  }
  
  // Fall back to default output
  if (script.defaultOutput) {
    return {
      success: true,
      result: script.defaultOutput,
      logs: [],
    }
  }
  
  return {
    success: false,
    error: `No mock output defined for script: ${script.id}`,
    logs: [`Mock script ${script.id} has no output for context`],
  }
}

/**
 * Registry of mock package outputs
 * This is populated by individual package mock files
 */
export const mockPackageRegistry: Map<string, MockPackageManifest> = new Map()

/**
 * Register a mock package for Storybook rendering
 */
export function registerMockPackage(manifest: MockPackageManifest): void {
  mockPackageRegistry.set(manifest.id, manifest)
}

/**
 * Get a registered mock package
 */
export function getMockPackage(packageId: string): MockPackageManifest | undefined {
  return mockPackageRegistry.get(packageId)
}

/**
 * List all registered mock packages
 */
export function listMockPackages(): MockPackageManifest[] {
  return Array.from(mockPackageRegistry.values())
}
