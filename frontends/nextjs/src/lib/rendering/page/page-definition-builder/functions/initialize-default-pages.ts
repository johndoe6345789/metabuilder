import type { PageDefinition } from '@/lib/rendering/page/page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export async function initializeDefaultPages(): Promise<void> {
  const level1Homepage = this.buildLevel1Homepage()
  const level2UserDashboard = this.buildLevel2UserDashboard()
  const level3AdminPanel = this.buildLevel3AdminPanel()

  this.pages = [level1Homepage, level2UserDashboard, level3AdminPanel]

  for (const page of this.pages) {
    const existingPages = await Database.getPages()
    const exists = existingPages.some(p => p.id === page.id)

    if (!exists) {
      await Database.addPage({
        id: page.id,
        path: `/_page_${page.id}`,
        title: page.title,
        level: page.level,
        componentTree: page.components,
        requiresAuth: page.permissions?.requiresAuth || false,
        requiredRole: page.permissions?.requiredRole as any,
      })
    }
  }
}
