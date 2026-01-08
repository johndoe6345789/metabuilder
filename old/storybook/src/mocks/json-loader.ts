/**
 * JSON Mock Loader
 *
 * Loads mock package definitions from JSON files in the data/ directory.
 * No manual TypeScript registration needed - just add a JSON file!
 */

import type { JsonMockPackage, TemplateVariables } from './schema'
import { processTemplates } from './schema'

// Import all JSON mock files (Vite handles JSON imports natively)
import dashboardMock from './data/dashboard.json'
import dataTableMock from './data/data_table.json'
import navMenuMock from './data/nav_menu.json'
import uiLevel4Mock from './data/ui_level4.json'
import uiLoginMock from './data/ui_login.json'
import userManagerMock from './data/user_manager.json'

export interface RenderContext {
  user?: {
    id?: string
    username?: string
    email?: string
    level?: number
  }
  tenant?: {
    id?: string
    name?: string
  }
  nerdMode?: boolean
  theme?: string
}

export interface MockResult {
  success: boolean
  result?: Record<string, unknown>
  error?: string
  logs: string[]
}

export interface MockPackageDefinition {
  metadata: JsonMockPackage['metadata']
  renders: Record<string, JsonMockRender>
}

export interface JsonMockRender {
  component: JsonMockPackage['renders'][string]['component']
  description?: string
}

const mockPackages = new Map<string, MockPackageDefinition>()

export function registerMockPackage(pkg: MockPackageDefinition): void {
  if (!pkg.metadata?.packageId) return
  mockPackages.set(pkg.metadata.packageId, pkg)
}

export function getMockPackage(packageId: string): MockPackageDefinition | undefined {
  return mockPackages.get(packageId)
}

export function listMockPackages(): MockPackageDefinition[] {
  return Array.from(mockPackages.values())
}

export function registerJsonMocks(): void {
  const jsonMocks: JsonMockPackage[] = [
    dashboardMock as unknown as JsonMockPackage,
    dataTableMock as unknown as JsonMockPackage,
    navMenuMock as unknown as JsonMockPackage,
    uiLevel4Mock as unknown as JsonMockPackage,
    uiLoginMock as unknown as JsonMockPackage,
    userManagerMock as unknown as JsonMockPackage,
  ]

  for (const json of jsonMocks) {
    const pkg: MockPackageDefinition = {
      metadata: json.metadata,
      renders: Object.fromEntries(
        Object.entries(json.renders).map(([name, render]) => [
          name,
          {
            component: render.component,
            description: render.description,
          },
        ])
      ),
    }
    registerMockPackage(pkg)
  }
}

export function getRenderDescriptions(packageId: string): Record<string, string> {
  const pkg = getMockPackage(packageId)
  if (!pkg) return {}

  const descriptions: Record<string, string> = {}
  for (const [name, render] of Object.entries(pkg.renders)) {
    descriptions[name] = render.description || ''
  }
  return descriptions
}

export function executeJsonMock(
  packageId: string,
  scriptName: string,
  context: RenderContext
): MockResult {
  const pkg = getMockPackage(packageId)
  if (!pkg) {
    return { success: false, error: `Package not found: ${packageId}`, logs: [] }
  }

  const render = pkg.renders[scriptName]
  if (!render) {
    return {
      success: false,
      error: `Render not found: ${scriptName}`,
      logs: [`Available: ${Object.keys(pkg.renders).join(', ')}`],
    }
  }

  const variables: TemplateVariables = {
    'user.username': context.user?.username ?? 'Guest',
    'user.email': context.user?.email ?? 'guest@example.com',
    'user.level': context.user?.level ?? 1,
    'user.id': context.user?.id ?? 'guest',
    'tenant.name': context.tenant?.name ?? 'Default',
    'tenant.id': context.tenant?.id ?? 'default',
    'nerdMode': context.nerdMode ?? false,
    'theme': context.theme ?? 'light',
  }

  const result = processTemplates(render.component, variables)

  return {
    success: true,
    result,
    logs: [],
  }
}

export function executeMockRender(
  packageId: string,
  scriptName: string,
  context: RenderContext
): MockResult {
  return executeJsonMock(packageId, scriptName, context)
}

export function createDefaultContext(): RenderContext {
  return {
    user: {
      id: 'guest',
      username: 'guest',
      email: 'guest@example.com',
      level: 1,
    },
    tenant: {
      id: 'default',
      name: 'Default Tenant',
    },
    nerdMode: false,
    theme: 'light',
  }
}
