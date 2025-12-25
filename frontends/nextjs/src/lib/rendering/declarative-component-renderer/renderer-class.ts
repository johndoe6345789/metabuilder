import type { DeclarativeComponentConfig, LuaScriptDefinition } from './types'
import { createDeclarativeRendererState } from './renderer-state'
import { executeLuaScript } from './execute-lua-script'
import { getComponentConfig } from './get-component-config'
import { hasComponentConfig } from './has-component-config'
import { interpolateValue } from './interpolate-value'
import { evaluateConditional } from './evaluate-conditional'
import { registerComponentConfig } from './register-component-config'
import { registerLuaScript } from './register-lua-script'
import { resolveDataSource } from './resolve-data-source'

export class DeclarativeComponentRenderer {
  private state = createDeclarativeRendererState()

  registerComponentConfig(componentType: string, config: DeclarativeComponentConfig) {
    registerComponentConfig(this.state, componentType, config)
  }

  registerLuaScript(scriptId: string, script: LuaScriptDefinition) {
    registerLuaScript(this.state, scriptId, script)
  }

  async executeLuaScript(scriptId: string, params: any[]): Promise<any> {
    return executeLuaScript(this.state, scriptId, params)
  }

  getComponentConfig(componentType: string): DeclarativeComponentConfig | undefined {
    return getComponentConfig(this.state, componentType)
  }

  hasComponentConfig(componentType: string): boolean {
    return hasComponentConfig(this.state, componentType)
  }

  interpolateValue(template: string, context: Record<string, any>): string {
    return interpolateValue(template, context)
  }

  evaluateConditional(condition: string | boolean, context: Record<string, any>): boolean {
    return evaluateConditional(condition, context)
  }

  resolveDataSource(dataSource: string, context: Record<string, any>): any[] {
    return resolveDataSource(dataSource, context)
  }
}
