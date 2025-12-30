/**
 * Mock Lua Engine for Storybook
 * 
 * Provides mock outputs for Lua packages without running actual Lua code.
 * This allows Storybook to render Lua packages in a browser environment.
 */

import type { LuaUIComponent, LuaRenderContext, LuaPackageMetadata } from '../types/lua-types'

export interface MockLuaResult {
  success: boolean
  result?: LuaUIComponent
  error?: string
  logs: string[]
}

export interface MockPackageDefinition {
  metadata: LuaPackageMetadata
  /**
   * Pre-rendered component trees for different render functions
   * Key is the script/render function name (e.g., 'layout.render', 'stats.card')
   */
  renders: Record<string, (ctx: LuaRenderContext) => LuaUIComponent>
}

/**
 * Registry of mock packages
 */
const mockPackageRegistry = new Map<string, MockPackageDefinition>()

/**
 * Register a mock package
 * If the package already exists, merges renders instead of replacing
 */
export function registerMockPackage(pkg: MockPackageDefinition): void {
  const existing = mockPackageRegistry.get(pkg.metadata.packageId)
  if (existing) {
    // Merge renders - new renders override existing ones with same name
    existing.renders = { ...existing.renders, ...pkg.renders }
    // Update metadata
    existing.metadata = pkg.metadata
  } else {
    mockPackageRegistry.set(pkg.metadata.packageId, pkg)
  }
}

/**
 * Get a mock package by ID
 */
export function getMockPackage(packageId: string): MockPackageDefinition | undefined {
  return mockPackageRegistry.get(packageId)
}

/**
 * List all registered mock packages
 */
export function listMockPackages(): MockPackageDefinition[] {
  return Array.from(mockPackageRegistry.values())
}

/**
 * Execute a mock render function
 */
export function executeMockRender(
  packageId: string,
  renderName: string,
  context: LuaRenderContext
): MockLuaResult {
  const pkg = mockPackageRegistry.get(packageId)
  if (!pkg) {
    return {
      success: false,
      error: `Package not found: ${packageId}`,
      logs: [],
    }
  }

  const renderFn = pkg.renders[renderName]
  if (!renderFn) {
    return {
      success: false,
      error: `Render function not found: ${packageId}/${renderName}`,
      logs: [`Available renders: ${Object.keys(pkg.renders).join(', ')}`],
    }
  }

  try {
    const result = renderFn(context)
    return {
      success: true,
      result,
      logs: [],
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
      logs: [],
    }
  }
}

/**
 * Create a default context for testing
 */
export function createDefaultContext(overrides?: Partial<LuaRenderContext>): LuaRenderContext {
  return {
    user: {
      id: 'mock-1',
      username: 'storybook_user',
      level: 4,
      email: 'user@example.com',
    },
    nerdMode: false,
    theme: 'light',
    ...overrides,
  }
}
