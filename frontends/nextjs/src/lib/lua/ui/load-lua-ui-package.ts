import { readdir,readFile } from 'fs/promises'
import { join } from 'path'

import { createLuaEngine } from '@/lib/lua/engine/core/create-lua-engine'
import { executeLuaCode } from '@/lib/lua/functions/execution/execute-lua-code'

import type {
  LuaUIComponent,
  LuaUIManifest,
  LuaUIPackage,
  LuaUIPage,
} from './types/lua-ui-package'

/**
 * Load a Lua UI package from a directory containing manifest.json and .lua files
 */
export async function loadLuaUIPackage(packagePath: string): Promise<LuaUIPackage> {
  // Read manifest.json
  const manifestPath = join(packagePath, 'manifest.json')
  const manifestContent = await readFile(manifestPath, 'utf-8')
  const manifest: LuaUIManifest = JSON.parse(manifestContent)

  // Load all page files
  const pages: LuaUIPage[] = []
  for (const pageManifest of manifest.pages) {
    const pagePath = join(packagePath, pageManifest.file)
    const pageSource = await readFile(pagePath, 'utf-8')

    const engine = createLuaEngine()
    const result = await executeLuaCode(engine.L, pageSource, {}, [])

    if (!result.success) {
      engine.destroy()
      throw new Error(`Failed to load page ${pageManifest.file}: ${result.error}`)
    }

    // Expect the Lua file to return a module with a render() function
    const module = result.result as { render?: () => LuaUIComponent }
    if (!module?.render) {
      engine.destroy()
      throw new Error(`Page ${pageManifest.file} must return a module with render() function`)
    }

    const layout = module.render()
    engine.destroy()

    pages.push({
      path: pageManifest.path,
      title: pageManifest.title,
      level: pageManifest.level,
      requiresAuth: pageManifest.requiresAuth,
      requiredRole: pageManifest.requiredRole,
      layout,
    })
  }

  // Load all action files
  const actions: Record<string, Function> = {}
  if (manifest.actions) {
    for (const actionManifest of manifest.actions) {
      const actionPath = join(packagePath, actionManifest.file)
      const actionSource = await readFile(actionPath, 'utf-8')

      const engine = createLuaEngine()
      const result = await executeLuaCode(engine.L, actionSource, {}, [])

      if (!result.success) {
        engine.destroy()
        throw new Error(`Failed to load actions ${actionManifest.file}: ${result.error}`)
      }

      // Expect the Lua file to return a module with action functions
      const module = result.result as Record<string, Function>
      if (typeof module !== 'object') {
        engine.destroy()
        throw new Error(`Action file ${actionManifest.file} must return a module table`)
      }

      // Merge all functions from the module
      Object.assign(actions, module)
      engine.destroy()
    }
  }

  return {
    manifest,
    pages,
    actions,
  }
}
