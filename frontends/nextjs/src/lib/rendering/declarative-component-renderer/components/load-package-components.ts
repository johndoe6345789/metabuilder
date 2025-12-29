import { getDeclarativeRenderer } from '../renderer/get-declarative-renderer'
import type { DeclarativeComponentConfig } from '../types'

export function loadPackageComponents(packageContent: any) {
  const renderer = getDeclarativeRenderer()

  if (packageContent.componentConfigs) {
    Object.entries(packageContent.componentConfigs).forEach(([type, config]) => {
      renderer.registerComponentConfig(type, config as DeclarativeComponentConfig)
    })
  }

  if (packageContent.luaScripts) {
    packageContent.luaScripts.forEach((script: any) => {
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
