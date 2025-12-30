import { evaluateConditional } from '../evaluation/evaluate-conditional'
import { executeLuaScript } from '../lua/execute-lua-script'
import { getComponentConfig } from '../components/get-component-config'
import { hasComponentConfig } from '../components/has-component-config'
import { interpolateValue } from '../evaluation/interpolate-value'
import { registerComponentConfig } from '../components/register-component-config'
import { registerLuaScript } from '../lua/register-lua-script'
import { createDeclarativeRendererState } from './renderer-state'
import { resolveDataSource } from '../evaluation/resolve-data-source'
import type { DeclarativeComponentConfig, LuaScriptDefinition } from '../types'

export class DeclarativeComponentRenderer {
  private readonly state = createDeclarativeRendererState()

  registerComponentConfig(componentType: string, config: DeclarativeComponentConfig): void {
    registerComponentConfig(this.state, componentType, config)
  }

  registerLuaScript(scriptId: string, script: LuaScriptDefinition): void {
    registerLuaScript(this.state, scriptId, script)
  }

  async executeLuaScript(scriptId: string, params: unknown[]): Promise<unknown> {
    return executeLuaScript(this.state, scriptId, params)
  }

  getComponentConfig(componentType: string): DeclarativeComponentConfig | undefined {
    return getComponentConfig(this.state, componentType)
  }

  hasComponentConfig(componentType: string): boolean {
    return hasComponentConfig(this.state, componentType)
  }

  interpolateValue(template: string, context: Record<string, unknown>): string {
    return interpolateValue(template, context)
  }

  evaluateConditional(condition: string | boolean, context: Record<string, unknown>): boolean {
    return evaluateConditional(condition, context)
  }

  resolveDataSource(dataSource: string, context: Record<string, unknown>): unknown[] {
    return resolveDataSource(dataSource, context)
  }
}
