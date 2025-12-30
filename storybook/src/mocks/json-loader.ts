/**
 * JSON Mock Loader
 * 
 * Loads mock package definitions from JSON files in the data/ directory.
 * No manual TypeScript registration needed - just add a JSON file!
 */

import type { LuaRenderContext, LuaUIComponent } from '../types/lua-types'
import type { MockLuaResult, MockPackageDefinition } from './lua-engine'
import { registerMockPackage } from './lua-engine'
import type { JsonMockPackage, TemplateVariables } from './schema'
import { processTemplates } from './schema'

// Import all JSON mock files
// Vite handles JSON imports natively
import dashboardMock from './data/dashboard.json'
import dataTableMock from './data/data_table.json'
import navMenuMock from './data/nav_menu.json'
import uiLevel4Mock from './data/ui_level4.json'
import uiLoginMock from './data/ui_login.json'
import userManagerMock from './data/user_manager.json'

/**
 * Convert a JSON mock package to a runtime MockPackageDefinition
 */
function jsonToMockPackage(json: JsonMockPackage): MockPackageDefinition {
  const renders: Record<string, (ctx: LuaRenderContext) => LuaUIComponent> = {}

  for (const [scriptName, render] of Object.entries(json.renders)) {
    renders[scriptName] = (ctx: LuaRenderContext) => {
      // Build template variables from context
      const variables: TemplateVariables = {
        'user.username': ctx.user?.username ?? 'Guest',
        'user.email': ctx.user?.email ?? 'guest@example.com',
        'user.level': ctx.user?.level ?? 1,
        'user.id': ctx.user?.id ?? 'guest',
        'tenant.name': ctx.tenant?.name ?? 'Default',
        'tenant.id': ctx.tenant?.id ?? 'default',
        'nerdMode': ctx.nerdMode ?? false,
        'theme': ctx.theme ?? 'light',
      }

      // Process templates and return component
      return processTemplates(render.component, variables)
    }
  }

  return {
    metadata: json.metadata,
    renders,
  }
}

/**
 * All JSON mock packages
 */
const jsonMocks: JsonMockPackage[] = [
  dashboardMock as unknown as JsonMockPackage,
  dataTableMock as unknown as JsonMockPackage,
  navMenuMock as unknown as JsonMockPackage,
  uiLevel4Mock as unknown as JsonMockPackage,
  uiLoginMock as unknown as JsonMockPackage,
  userManagerMock as unknown as JsonMockPackage,
]

/**
 * Register all JSON mocks
 * Call this once at startup
 */
export function registerJsonMocks(): void {
  for (const json of jsonMocks) {
    const pkg = jsonToMockPackage(json)
    registerMockPackage(pkg)
  }
}

/**
 * Get render descriptions for documentation
 */
export function getRenderDescriptions(packageId: string): Record<string, string> {
  const json = jsonMocks.find(m => m.metadata.packageId === packageId)
  if (!json) return {}

  const descriptions: Record<string, string> = {}
  for (const [name, render] of Object.entries(json.renders)) {
    descriptions[name] = render.description || ''
  }
  return descriptions
}

/**
 * Execute a JSON mock render directly (for testing)
 */
export function executeJsonMock(
  packageId: string,
  scriptName: string,
  context: LuaRenderContext
): MockLuaResult {
  const json = jsonMocks.find(m => m.metadata.packageId === packageId)
  if (!json) {
    return { success: false, error: `Package not found: ${packageId}`, logs: [] }
  }

  const render = json.renders[scriptName]
  if (!render) {
    return {
      success: false,
      error: `Render not found: ${scriptName}`,
      logs: [`Available: ${Object.keys(json.renders).join(', ')}`],
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

  return {
    success: true,
    result: processTemplates(render.component, variables),
    logs: [],
  }
}
