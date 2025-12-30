/**
 * Package Auto-Loader
 * 
 * Loads component trees and metadata directly from the actual packages.
 * No manual mocking needed - reads from packages/{id}/seed/
 */

import type { LuaUIComponent, LuaPackageMetadata, LuaRenderContext } from '../types/lua-types'
import type { MockLuaResult, MockPackageDefinition } from './lua-engine'
import { registerMockPackage } from './lua-engine'
import type { TemplateVariables } from './schema'
import { processTemplates } from './schema'

/**
 * Component definition from components.json
 */
interface PackageComponent {
  id: string
  type: string
  props?: Record<string, unknown>
  children?: PackageComponent[]
  layout?: PackageComponent  // Some components define their tree in 'layout' instead of directly
}

/**
 * Convert a PackageComponent to LuaUIComponent
 * Handles both direct children and layout-based component definitions
 */
function packageComponentToLua(component: PackageComponent): LuaUIComponent {
  // If component has a layout property, use that as the actual component tree
  if (component.layout) {
    return packageComponentToLua(component.layout)
  }
  
  return {
    type: component.type,
    props: component.props,
    children: component.children?.map(packageComponentToLua),
  }
}

/**
 * Load package metadata from the actual package
 */
export async function loadPackageMetadata(packageId: string): Promise<LuaPackageMetadata | null> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/metadata.json`)
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  }
}

/**
 * Load components.json from a package
 */
export async function loadPackageComponents(packageId: string): Promise<PackageComponent[]> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/components.json`)
    if (!response.ok) return []
    const components = await response.json()
    return Array.isArray(components) ? components : []
  } catch {
    return []
  }
}

/**
 * Load script manifest from a package
 */
export async function loadPackageScripts(packageId: string): Promise<Array<{ file: string; name: string; description?: string }>> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/scripts/manifest.json`)
    if (!response.ok) return []
    const manifest = await response.json()
    return manifest.scripts || []
  } catch {
    return []
  }
}

/**
 * Create template variables from context
 */
function createTemplateVars(ctx: LuaRenderContext): TemplateVariables {
  return {
    'user.username': ctx.user?.username ?? 'Guest',
    'user.email': ctx.user?.email ?? 'guest@example.com',
    'user.level': ctx.user?.level ?? 1,
    'user.id': ctx.user?.id ?? 'guest',
    'tenant.name': ctx.tenant?.name ?? 'Default',
    'tenant.id': ctx.tenant?.id ?? 'default',
    'nerdMode': ctx.nerdMode ?? false,
    'theme': ctx.theme ?? 'light',
  }
}

/**
 * Auto-generate renders from components.json
 * Each component becomes a render with its id as the key
 */
function componentsToRenders(
  components: PackageComponent[],
  scripts: Array<{ file: string; name: string; description?: string; category?: string }> = []
): Record<string, (ctx: LuaRenderContext) => LuaUIComponent> {
  const renders: Record<string, (ctx: LuaRenderContext) => LuaUIComponent> = {}

  for (const component of components) {
    const luaComponent = packageComponentToLua(component)
    
    // Register by component id (e.g., "stat_card", "dashboard_grid")
    renders[component.id] = (ctx: LuaRenderContext) => {
      const vars = createTemplateVars(ctx)
      return processTemplates(luaComponent, vars)
    }
    
    // Also register with .json suffix for discovery
    renders[`${component.id}.json`] = renders[component.id]
  }

  // Add common script aliases pointing to first component
  // This handles cases where manifest.json says "render.lua" but component id differs
  if (components.length > 0) {
    const mainRender = renders[components[0].id]
    const scriptAliases = ['render.lua', 'render', 'main.lua', 'main', 'layout.lua', 'layout']
    for (const alias of scriptAliases) {
      if (!renders[alias]) {
        renders[alias] = mainRender
      }
    }
  }

  // Add stub renders for utility scripts (non-rendering scripts from manifest)
  // This prevents "Render function not found" errors when someone clicks on them
  for (const script of scripts) {
    const scriptFile = script.file
    const scriptName = script.name
    
    // Skip if already registered
    if (renders[scriptFile] || renders[scriptName]) continue
    
    // Create a friendly stub that shows script info
    const stubRender = () => ({
      type: 'Alert',
      props: { severity: 'info' },
      children: [
        {
          type: 'Typography',
          props: { variant: 'subtitle1', text: `📜 ${script.name}` },
        },
        {
          type: 'Typography',
          props: { 
            variant: 'body2', 
            text: script.description || 'Utility script (no visual render)',
          },
        },
        script.category ? {
          type: 'Typography',
          props: { 
            variant: 'caption', 
            text: `Category: ${script.category}`,
            className: 'text-muted-foreground',
          },
        } : null,
      ].filter(Boolean),
    })
    
    renders[scriptFile] = stubRender
    renders[scriptName] = stubRender
  }

  // Add a special "all_components" render that shows all components
  if (components.length > 0) {
    renders['all_components'] = (ctx: LuaRenderContext) => {
      const vars = createTemplateVars(ctx)
      return processTemplates({
        type: 'Stack',
        props: { spacing: 4 },
        children: components.map(c => ({
          type: 'Box',
          children: [
            {
              type: 'Typography',
              props: { variant: 'overline', text: c.id },
            },
            packageComponentToLua(c),
          ],
        })),
      }, vars)
    }
  }

  return renders
}

/**
 * Auto-load a package from the workspace
 * Reads metadata.json and components.json directly
 */
export async function autoLoadPackage(packageId: string): Promise<MockPackageDefinition | null> {
  const [metadata, components, scripts] = await Promise.all([
    loadPackageMetadata(packageId),
    loadPackageComponents(packageId),
    loadPackageScripts(packageId),
  ])

  if (!metadata) {
    console.warn(`[AutoLoader] No metadata found for ${packageId}`)
    return null
  }

  // Generate renders from components, passing scripts for stub generation
  const renders = componentsToRenders(components, scripts)

  // Add an info render for packages with no components
  if (Object.keys(renders).length === 0) {
    renders['info'] = () => ({
      type: 'Alert',
      props: { severity: 'info' },
      children: [
        {
          type: 'Typography',
          props: {
            variant: 'body2',
            text: `Package "${metadata.name}" has no components.json definitions. Scripts: ${metadata.exports?.scripts?.join(', ') || 'none'}`,
          },
        },
      ],
    })
  }

  return {
    metadata,
    renders,
  }
}

/**
 * Auto-load and register a package
 */
export async function autoRegisterPackage(packageId: string): Promise<boolean> {
  const pkg = await autoLoadPackage(packageId)
  if (pkg) {
    registerMockPackage(pkg)
    return true
  }
  return false
}

/**
 * Auto-load multiple packages
 */
export async function autoRegisterPackages(packageIds: string[]): Promise<string[]> {
  const registered: string[] = []
  
  await Promise.all(
    packageIds.map(async (id) => {
      const success = await autoRegisterPackage(id)
      if (success) registered.push(id)
    })
  )
  
  return registered
}

/**
 * Execute a render from an auto-loaded package
 */
export function executeAutoRender(
  packageId: string,
  componentId: string,
  context: LuaRenderContext,
  components: PackageComponent[]
): MockLuaResult {
  const component = components.find(c => c.id === componentId)
  
  if (!component) {
    return {
      success: false,
      error: `Component "${componentId}" not found in ${packageId}`,
      logs: [`Available: ${components.map(c => c.id).join(', ')}`],
    }
  }

  const luaComponent = packageComponentToLua(component)
  const vars = createTemplateVars(context)
  
  return {
    success: true,
    result: processTemplates(luaComponent, vars),
    logs: [],
  }
}
