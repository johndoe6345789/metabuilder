import { Database } from '@/lib/database'
import type { LuaEngine } from '@/lib/lua-engine'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export async function loadPages(): Promise<void> {
    const savedPages = await Database.getPages()
    savedPages.forEach(page => {
      const pageDef: PageDefinition = {
        id: page.id,
        level: page.level as 1 | 2 | 3 | 4 | 5 | 6,
        title: page.title,
        layout: 'default',
        components: page.componentTree,
        permissions: {
          requiresAuth: page.requiresAuth,
          requiredRole: page.requiredRole
        }
      }
      this.pages.set(page.id, pageDef)
    })
  }
