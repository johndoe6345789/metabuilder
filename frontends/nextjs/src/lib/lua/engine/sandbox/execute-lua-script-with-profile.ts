import type { LuaScript } from '../types/level-types'
import type { LuaExecutionContext, LuaExecutionResult } from './functions/types'
import { createLuaEngine } from './create-lua-engine'
import { createSandboxedLuaEngine } from './create-sandboxed-lua-engine'

type LuaScriptProfile = Pick<LuaScript, 'isSandboxed' | 'allowedGlobals' | 'timeoutMs'>

export async function executeLuaScriptWithProfile(
  code: string,
  context: LuaExecutionContext = {},
  profile: LuaScriptProfile = {}
): Promise<LuaExecutionResult> {
  const isSandboxed = profile.isSandboxed ?? true

  if (!isSandboxed) {
    const engine = createLuaEngine()
    try {
      return await engine.execute(code, context)
    } finally {
      engine.destroy()
    }
  }

  const engine = createSandboxedLuaEngine(profile.timeoutMs ?? 5000)
  engine.setAllowedGlobals(profile.allowedGlobals)

  try {
    const result = await engine.executeWithSandbox(code, context)
    return result.execution
  } finally {
    engine.destroy()
  }
}
