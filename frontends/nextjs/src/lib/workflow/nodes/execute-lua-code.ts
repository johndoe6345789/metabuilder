import { createSandboxedLuaEngine } from '../../lua/engine/sandbox/create-sandboxed-lua-engine'
import type { SandboxedLuaResult } from '../../lua/engine/sandbox/sandboxed-lua-engine'
import type { WorkflowExecutionContext } from '../workflow-execution-context'
import type { WorkflowState } from '../workflow-state'
import { logToWorkflow } from '../log-to-workflow'

/**
 * Execute Lua code in sandbox
 */
export async function executeLuaCode(
  code: string,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  const engine = createSandboxedLuaEngine()

  try {
    const luaContext = {
      data,
      user: context.user,
      log: (...args: any[]) => logToWorkflow(state, ...args),
    }

    const result: SandboxedLuaResult = await engine.executeWithSandbox(code, luaContext)

    if (result.security.severity === 'critical' || result.security.severity === 'high') {
      state.securityWarnings.push(
        `Security issues detected: ${result.security.issues.map((i) => i.message).join(', ')}`
      )
    }

    result.execution.logs.forEach((log) => logToWorkflow(state, `[Lua] ${log}`))

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
