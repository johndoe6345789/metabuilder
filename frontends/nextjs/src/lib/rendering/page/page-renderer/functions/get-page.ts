import { Database } from '@/lib/database'
import type { LuaEngine } from '@/lib/lua-engine'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export function getPage(id: string): PageDefinition | undefined {
    return this.pages.get(id)
  }
