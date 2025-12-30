import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import type { JsonObject } from '@/types/utility-types'

type SqlParam = string | number | boolean | null

type UIPagesDb = {
  query<T = JsonObject>(sql: string, params?: SqlParam[]): Promise<T[]>
  execute(sql: string, params?: SqlParam[]): Promise<void>
}

/**
 * Import UI pages from JSON seed data into the database
 * Flow: JSON (packages/ui_pages/seed/pages/*.json) → Database (ui_page table)
 */
export async function importUIPages(db: UIPagesDb): Promise<void> {
  const pagesDir = join(process.cwd(), '../../packages/ui_pages/seed/pages')

  try {
    const files = await readdir(pagesDir)
    const jsonFiles = files.filter(f => f.endsWith('.json'))

    console.log(`Found ${jsonFiles.length} UI page definitions`)

    for (const file of jsonFiles) {
      const filePath = join(pagesDir, file)
      const content = await readFile(filePath, 'utf-8')
      const pageData = JSON.parse(content) as UIPageSeed

      // Check if page already exists
      const existing = await db.query(
        'SELECT id FROM ui_page WHERE path = ?',
        [pageData.path]
      )

      if (existing.length > 0) {
        // Update existing page
        await db.execute(
          `UPDATE ui_page
           SET title = ?, level = ?, require_auth = ?, required_role = ?,
               layout = ?, actions = ?, is_active = ?, updated_at = NOW()
           WHERE path = ?`,
          [
            pageData.title,
            pageData.level,
            pageData.requiresAuth || false,
            pageData.requiredRole || null,
            JSON.stringify(pageData.layout),
            pageData.actions ? JSON.stringify(pageData.actions) : null,
            pageData.isActive !== false,
            pageData.path,
          ]
        )
        console.log(`✓ Updated page: ${pageData.path}`)
      } else {
        // Insert new page
        await db.execute(
          `INSERT INTO ui_page
           (path, title, level, require_auth, required_role, layout, actions, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            pageData.path,
            pageData.title,
            pageData.level,
            pageData.requiresAuth || false,
            pageData.requiredRole || null,
            JSON.stringify(pageData.layout),
            pageData.actions ? JSON.stringify(pageData.actions) : null,
            pageData.isActive !== false,
          ]
        )
        console.log(`✓ Imported page: ${pageData.path}`)
      }
    }

    console.log(`Successfully imported ${jsonFiles.length} UI pages`)
  } catch (error) {
    console.error('Error importing UI pages:', error)
    throw error
  }
}

/**
 * Seed data structure from JSON files
 */
interface UIPageSeed {
  path: string
  title: string
  level: number
  requiresAuth?: boolean
  requiredRole?: string
  layout: JsonObject
  actions?: JsonObject
  isActive?: boolean
}

/**
 * Database record structure
 */
export interface UIPageRecord {
  id: string
  path: string
  title: string
  level: number
  require_auth: boolean
  required_role: string | null
  layout: JsonObject
  actions: JsonObject | null
  package_id: string | null
  is_active: boolean
  created_at: Date
  updated_at: Date
  created_by: string | null
}
