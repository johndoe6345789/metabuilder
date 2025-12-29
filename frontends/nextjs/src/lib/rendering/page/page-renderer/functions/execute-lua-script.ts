import { Database } from '@/lib/database'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { LuaEngine } from '@/lib/lua-engine'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export async function executeLuaScript(scriptId: string, context: any): Promise<any> {
  const scripts = await Database.getLuaScripts()
  const script = scripts.find(s => s.id === scriptId)
  if (!script) {
    throw new Error(`Lua script not found: ${scriptId}`)
  }

  const result = await executeLuaScriptWithProfile(script.code, context, script)
  if (!result.success) {
    throw new Error(result.error || 'Lua execution failed')
  }

  return result.result
}
