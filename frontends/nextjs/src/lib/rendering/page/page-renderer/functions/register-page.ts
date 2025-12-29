import { Database } from '@/lib/database'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { LuaEngine } from '@/lib/lua-engine'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export async function registerPage(page: PageDefinition): Promise<void> {
  this.pages.set(page.id, page)
  const pageConfig = {
    id: page.id,
    path: `/_page_${page.id}`,
    title: page.title,
    level: page.level,
    componentTree: page.components,
    requiresAuth: page.permissions?.requiresAuth || false,
    requiredRole: page.permissions?.requiredRole as any,
  }
  await Database.addPage(pageConfig)
}
