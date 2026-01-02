/**
 * Load Pages from JSON Packages
 *
 * Replacement for Lua package loading - uses pure JSON packages
 */

import { join } from 'path'
import type { JSONPackage } from '../packages/json/load-json-package'
import { loadJSONPackage } from '../packages/json/load-json-package'

export interface JSONPage {
  path: string
  title: string
  level: number
  requiresAuth: boolean
  requiredRole?: string
  layout: any
  packageId: string
}

/**
 * Load pages from all JSON packages
 */
export async function loadPagesFromJSONPackages(packagesDir: string): Promise<JSONPage[]> {
  const { readdir } = await import('fs/promises')
  const pages: JSONPage[] = []

  try {
    const packageDirs = await readdir(packagesDir, { withFileTypes: true })

    for (const dir of packageDirs) {
      if (dir.isDirectory()) {
        try {
          const packagePath = join(packagesDir, dir.name)
          const pkg = await loadJSONPackage(packagePath)

          // Load pages from package if they exist
          const packagePages = await loadPagesFromPackage(pkg, packagePath)
          pages.push(...packagePages)
        } catch (error) {
          console.warn(`Failed to load pages from package ${dir.name}:`, error)
        }
      }
    }

    return pages
  } catch (error) {
    console.error('Failed to load pages from JSON packages:', error)
    return []
  }
}

/**
 * Load pages from a single JSON package
 */
async function loadPagesFromPackage(
  pkg: JSONPackage,
  packagePath: string
): Promise<JSONPage[]> {
  const { readFile } = await import('fs/promises')
  const pages: JSONPage[] = []

  try {
    // Try to load pages definition from package
    const pagesPath = join(packagePath, 'pages', 'index.json')
    const pagesContent = await readFile(pagesPath, 'utf-8')
    const pagesData = JSON.parse(pagesContent)

    if (pagesData.pages && Array.isArray(pagesData.pages)) {
      for (const pageDef of pagesData.pages) {
        pages.push({
          path: pageDef.path,
          title: pageDef.title,
          level: pageDef.level || pkg.metadata.minLevel || 0,
          requiresAuth: pageDef.requiresAuth !== false,
          requiredRole: pageDef.requiredRole,
          layout: pageDef.layout,
          packageId: pkg.metadata.packageId,
        })
      }
    }
  } catch (error) {
    // No pages file, that's okay - not all packages have pages
  }

  return pages
}

/**
 * Get page by path
 */
export async function getJSONPageByPath(
  packagesDir: string,
  path: string
): Promise<JSONPage | null> {
  const pages = await loadPagesFromJSONPackages(packagesDir)
  return pages.find((page) => page.path === path) || null
}

/**
 * Get pages by level
 */
export async function getJSONPagesByLevel(
  packagesDir: string,
  level: number
): Promise<JSONPage[]> {
  const pages = await loadPagesFromJSONPackages(packagesDir)
  return pages.filter((page) => page.level === level)
}
