import { Database } from '@/lib/database'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { LuaEngine } from '@/lib/lua-engine'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export async function onPageUnload(page: PageDefinition, context: PageContext): Promise<void> {
  if (page.luaScripts?.onUnload) {
    await this.executeLuaScript(page.luaScripts.onUnload, {
      data: {
        user: context.user,
        level: context.level,
      },
    })
  }
}
