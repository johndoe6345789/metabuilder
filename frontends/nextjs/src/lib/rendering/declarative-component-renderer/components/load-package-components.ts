import { getDeclarativeRenderer } from '../renderer/get-declarative-renderer'
import type { DeclarativeComponentConfig } from '../types'

interface LuaScriptConfig {
  id: string
  code: string
  parameters?: { name: string }[]
  returnType?: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
}

interface PackageContent {
  componentConfigs?: Record<string, DeclarativeComponentConfig>
  luaScripts?: LuaScriptConfig[]
}

export function loadPackageComponents(packageContent: PackageContent) {
  const renderer = getDeclarativeRenderer()

  if (packageContent.componentConfigs) {
    Object.entries(packageContent.componentConfigs).forEach(([type, config]) => {
      renderer.registerComponentConfig(type, config as DeclarativeComponentConfig)
    })
  }

  if (packageContent.luaScripts) {
    packageContent.luaScripts.forEach((script: LuaScriptConfig) => {
      renderer.registerLuaScript(script.id, {
        code: script.code,
        parameters: script.parameters || [],
        returnType: script.returnType || 'any',
        isSandboxed: script.isSandboxed,
        allowedGlobals: script.allowedGlobals,
        timeoutMs: script.timeoutMs,
      })
    })
  }
}
