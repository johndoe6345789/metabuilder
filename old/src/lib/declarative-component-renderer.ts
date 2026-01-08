import type { ComponentInstance } from './builder-types'
import { LuaEngine } from './lua-engine'

export interface DeclarativeComponentConfig {
  type: string
  category: string
  label: string
  description: string
  icon: string
  props: Array<{
    name: string
    type: string
    label: string
    defaultValue?: any
    required: boolean
  }>
  config: {
    layout: string
    styling: {
      className: string
    }
    children: any[]
  }
}

export interface MessageFormat {
  id: string
  username: string
  userId: string
  message: string
  timestamp: number
  type: 'message' | 'system' | 'join' | 'leave'
}

export class DeclarativeComponentRenderer {
  private luaEngine: LuaEngine
  private componentConfigs: Record<string, DeclarativeComponentConfig> = {}
  private luaScripts: Record<string, { code: string; parameters: any[]; returnType: string }> = {}

  constructor() {
    this.luaEngine = new LuaEngine()
  }

  registerComponentConfig(componentType: string, config: DeclarativeComponentConfig) {
    this.componentConfigs[componentType] = config
  }

  registerLuaScript(scriptId: string, script: { code: string; parameters: any[]; returnType: string }) {
    this.luaScripts[scriptId] = script
  }

  async executeLuaScript(scriptId: string, params: any[]): Promise<any> {
    const script = this.luaScripts[scriptId]
    if (!script) {
      throw new Error(`Lua script not found: ${scriptId}`)
    }

    const paramContext: Record<string, any> = {}
    script.parameters.forEach((param, index) => {
      if (params[index] !== undefined) {
        paramContext[param.name] = params[index]
      }
    })

    const paramAssignments = script.parameters
      .map(p => `local ${p.name} = context.data.params["${p.name}"]`)
      .join('\n')

    const paramList = script.parameters.map(p => p.name).join(', ')

    const wrappedCode = `
${paramAssignments}

${script.code}

local result_fn = sendMessage or handleCommand or formatTime or userJoin or userLeave or countThreads
if result_fn and type(result_fn) == "function" then
  return result_fn(${paramList})
end
`

    const result = await this.luaEngine.execute(wrappedCode, {
      data: { params: paramContext }
    })
    
    if (!result.success) {
      console.error(`Lua script error (${scriptId}):`, result.error, result.logs)
      throw new Error(result.error || 'Lua script execution failed')
    }

    return result.result
  }

  getComponentConfig(componentType: string): DeclarativeComponentConfig | undefined {
    return this.componentConfigs[componentType]
  }

  hasComponentConfig(componentType: string): boolean {
    return componentType in this.componentConfigs
  }

  interpolateValue(template: string, context: Record<string, any>): string {
    if (!template || typeof template !== 'string') return template

    return template.replace(/\{([^}]+)\}/g, (match, key) => {
      const value = context[key]
      return value !== undefined ? String(value) : match
    })
  }

  evaluateConditional(condition: string | boolean, context: Record<string, any>): boolean {
    if (typeof condition === 'boolean') return condition
    if (!condition) return true
    
    const value = context[condition]
    return Boolean(value)
  }

  resolveDataSource(dataSource: string, context: Record<string, any>): any[] {
    if (!dataSource) return []
    return context[dataSource] || []
  }
}

const globalRenderer = new DeclarativeComponentRenderer()

export function getDeclarativeRenderer(): DeclarativeComponentRenderer {
  return globalRenderer
}

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
      })
    })
  }
}
