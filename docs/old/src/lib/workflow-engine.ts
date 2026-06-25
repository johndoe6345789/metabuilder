import { createSandboxedLuaEngine, type SandboxedLuaResult } from './sandboxed-lua-engine'
import type { Workflow, WorkflowNode, LuaScript } from './level-types'

export interface WorkflowExecutionContext {
  data: any
  user?: any
  scripts?: LuaScript[]
}

export interface WorkflowExecutionResult {
  success: boolean
  outputs: Record<string, any>
  logs: string[]
  error?: string
  securityWarnings?: string[]
}

export class WorkflowEngine {
  private logs: string[] = []
  private securityWarnings: string[] = []

  async executeWorkflow(
    workflow: Workflow,
    context: WorkflowExecutionContext
  ): Promise<WorkflowExecutionResult> {
    this.logs = []
    this.securityWarnings = []
    const outputs: Record<string, any> = {}
    let currentData = context.data

    try {
      this.log(`Starting workflow: ${workflow.name}`)

      for (let i = 0; i < workflow.nodes.length; i++) {
        const node = workflow.nodes[i]
        this.log(`Executing node ${i + 1}: ${node.label} (${node.type})`)

        const nodeResult = await this.executeNode(node, currentData, context)

        if (!nodeResult.success) {
          return {
            success: false,
            outputs,
            logs: this.logs,
            error: `Node "${node.label}" failed: ${nodeResult.error}`,
            securityWarnings: this.securityWarnings,
          }
        }

        outputs[node.id] = nodeResult.output
        currentData = nodeResult.output

        if (node.type === 'condition' && nodeResult.output === false) {
          this.log(`Condition node returned false, stopping workflow`)
          break
        }
      }

      this.log(`Workflow completed successfully`)

      return {
        success: true,
        outputs,
        logs: this.logs,
        securityWarnings: this.securityWarnings,
      }
    } catch (error) {
      return {
        success: false,
        outputs,
        logs: this.logs,
        error: error instanceof Error ? error.message : String(error),
        securityWarnings: this.securityWarnings,
      }
    }
  }

  private async executeNode(
    node: WorkflowNode,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    try {
      switch (node.type) {
        case 'trigger':
          return { success: true, output: data }

        case 'action':
          return await this.executeActionNode(node, data, context)

        case 'condition':
          return await this.executeConditionNode(node, data, context)

        case 'lua':
          return await this.executeLuaNode(node, data, context)

        case 'transform':
          return await this.executeTransformNode(node, data, context)

        default:
          return {
            success: false,
            error: `Unknown node type: ${node.type}`,
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  private async executeActionNode(
    node: WorkflowNode,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    this.log(`Action: ${node.config.action || 'default'}`)
    return { success: true, output: data }
  }

  private async executeConditionNode(
    node: WorkflowNode,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const condition = node.config.condition || 'true'
    
    try {
      const result = new Function('data', 'context', `return ${condition}`)(
        data,
        context
      )
      this.log(`Condition evaluated to: ${result}`)
      return { success: true, output: result }
    } catch (error) {
      return {
        success: false,
        error: `Condition evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  private async executeLuaNode(
    node: WorkflowNode,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const scriptId = node.config.scriptId
    
    if (!scriptId || !context.scripts) {
      const luaCode = node.config.code || 'return context.data'
      return await this.executeLuaCode(luaCode, data, context)
    }

    const script = context.scripts.find((s) => s.id === scriptId)
    if (!script) {
      return {
        success: false,
        error: `Script not found: ${scriptId}`,
      }
    }

    return await this.executeLuaCode(script.code, data, context)
  }

  private async executeLuaCode(
    code: string,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const engine = createSandboxedLuaEngine()

    try {
      const luaContext = {
        data,
        user: context.user,
        log: (...args: any[]) => this.log(...args),
      }

      const result: SandboxedLuaResult = await engine.executeWithSandbox(code, luaContext)

      if (result.security.severity === 'critical' || result.security.severity === 'high') {
        this.securityWarnings.push(`Security issues detected: ${result.security.issues.map(i => i.message).join(', ')}`)
      }

      result.execution.logs.forEach((log) => this.log(`[Lua] ${log}`))

      if (!result.execution.success) {
        return {
          success: false,
          error: result.execution.error,
        }
      }

      return { success: true, output: result.execution.result }
    } finally {
      engine.destroy()
    }
  }

  private async executeTransformNode(
    node: WorkflowNode,
    data: any,
    context: WorkflowExecutionContext
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    const transform = node.config.transform || 'data'

    try {
      const result = new Function('data', 'context', `return ${transform}`)(
        data,
        context
      )
      this.log(`Transform result: ${JSON.stringify(result)}`)
      return { success: true, output: result }
    } catch (error) {
      return {
        success: false,
        error: `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  }

  private log(...args: any[]) {
    this.logs.push(args.map((arg) => String(arg)).join(' '))
  }
}

export function createWorkflowEngine(): WorkflowEngine {
  return new WorkflowEngine()
}
