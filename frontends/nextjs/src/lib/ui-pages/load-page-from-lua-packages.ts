import { constants } from 'fs'
import { access, readdir,readFile } from 'fs/promises'
import { join } from 'path'

import { loadLuaUIPackage } from '@/lib/lua/ui/load-lua-ui-package'
import type { JsonObject } from '@/types/utility-types'

import type { UIPageData } from './load-page-from-db'

const LUA_UI_PACKAGES_ROOT = join(process.cwd(), 'src/lib/packages/lua-ui')

/**
 * Load a UI page directly from Lua UI packages on disk.
 *
 * - Scans packages in src/lib/packages/lua-ui
 * - Uses manifest.json + Lua files to build the page definition
 * - Returns the same UIPageData shape used by database-backed pages
 */
export async function loadPageFromLuaPackages(path: string): Promise<UIPageData | null> {
  let packageEntries: Awaited<ReturnType<typeof readdir>>

  try {
    packageEntries = await readdir(LUA_UI_PACKAGES_ROOT, { withFileTypes: true })
  } catch (error) {
    console.error('Failed to read Lua UI packages directory', error)
    return null
  }

  for (const entry of packageEntries) {
    if (!entry.isDirectory()) {
      continue
    }

    const packagePath = join(LUA_UI_PACKAGES_ROOT, entry.name)
    const manifestPath = join(packagePath, 'manifest.json')

    try {
      await access(manifestPath, constants.F_OK)
    } catch (_error) {
      continue
    }

    // Quickly inspect manifest to see if this package provides the requested path
    try {
      const manifestContent = await readFile(manifestPath, 'utf-8')
      const manifest = JSON.parse(manifestContent) as { pages?: Array<{ path: string }> }

      const hasMatchingPage = manifest.pages?.some(page => page.path === path)

      if (!hasMatchingPage) {
        continue
      }
    } catch (error) {
      console.warn(`Skipping Lua UI package at ${packagePath}:`, error)
      continue
    }

    try {
      const uiPackage = await loadLuaUIPackage(packagePath)
      const page = uiPackage.pages.find(p => p.path === path)

      if (page) {
        return {
          path: page.path,
          title: page.title,
          level: page.level,
          requireAuth: page.requiresAuth ?? false,
          requiredRole: page.requiredRole,
          layout: page.layout as JsonObject,
          actions: uiPackage.actions,
        }
      }
    } catch (error) {
      // Skip packages that fail to load so other packages can still resolve the page
      console.warn(`Skipping Lua UI package at ${packagePath}:`, error)
    }
  }

  return null
}
