import type { WorkflowNode } from '../types/level-types'
import type { WorkflowExecutionContext } from '../workflow-execution-context'
import type { WorkflowState } from '../workflow-state'
import { executeActionNode } from '../nodes/execute-action-node'
import { executeConditionNode } from '../nodes/execute-condition-node'
import { executeLuaNode } from '../nodes/execute-lua-node'
import { executeTransformNode } from '../nodes/execute-transform-node'
import { logToWorkflow } from '../log-to-workflow'

type RetryConfig = {
  maxAttempts?: number
  delayMs?: number
  backoffMultiplier?: number
  jitterMs?: number
}

const DEFAULT_RETRY_CONFIG = {
  maxAttempts: 1,
  delayMs: 0,
  backoffMultiplier: 1,
  jitterMs: 0,
}

function normalizeRetryConfig(config: unknown) {
  if (!config || typeof config !== 'object') {
    return DEFAULT_RETRY_CONFIG
  }

  const values = config as RetryConfig
  const maxAttempts = Number.isFinite(values.maxAttempts)
    ? Math.max(1, Math.floor(values.maxAttempts as number))
    : DEFAULT_RETRY_CONFIG.maxAttempts
  const delayMs = Number.isFinite(values.delayMs)
    ? Math.max(0, Math.floor(values.delayMs as number))
    : DEFAULT_RETRY_CONFIG.delayMs
  const backoffMultiplier = Number.isFinite(values.backoffMultiplier)
    ? Math.max(1, Number(values.backoffMultiplier))
    : DEFAULT_RETRY_CONFIG.backoffMultiplier
  const jitterMs = Number.isFinite(values.jitterMs)
    ? Math.max(0, Math.floor(values.jitterMs as number))
    : DEFAULT_RETRY_CONFIG.jitterMs

  return {
    maxAttempts,
    delayMs,
    backoffMultiplier,
    jitterMs,
  }
}

function calculateRetryDelayMs(
  attempt: number,
  config: ReturnType<typeof normalizeRetryConfig>
) {
  if (config.delayMs <= 0) {
    return 0
  }

  const backoff = config.delayMs * Math.pow(config.backoffMultiplier, attempt - 1)
  const jitter = config.jitterMs > 0 ? Math.floor(Math.random() * config.jitterMs) : 0
  return Math.max(0, Math.floor(backoff + jitter))
}

async function sleep(delayMs: number) {
  if (delayMs <= 0) return
  await new Promise(resolve => setTimeout(resolve, delayMs))
}

/**
 * Execute a single workflow node
 */
async function executeNodeOnce(
  node: WorkflowNode,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  try {
    switch (node.type) {
      case 'trigger':
        return { success: true, output: data }

      case 'action':
        return await executeActionNode(node, data, context, state)

      case 'condition':
        return await executeConditionNode(node, data, context, state)

      case 'lua':
        return await executeLuaNode(node, data, context, state)

      case 'transform':
        return await executeTransformNode(node, data, context, state)

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

export async function executeNode(
  node: WorkflowNode,
  data: any,
  context: WorkflowExecutionContext,
  state: WorkflowState
): Promise<{ success: boolean; output?: any; error?: string }> {
  const retryConfig = normalizeRetryConfig(node.config?.retry)
  let attempt = 0
  let lastError: string | undefined

  while (attempt < retryConfig.maxAttempts) {
    attempt += 1
    const result = await executeNodeOnce(node, data, context, state)
    if (result.success) {
      return result
    }

    lastError = result.error
    if (attempt >= retryConfig.maxAttempts) {
      return result
    }

    logToWorkflow(
      state,
      `Retrying node "${node.label}" (attempt ${attempt + 1}/${retryConfig.maxAttempts}) after error: ${result.error}`
    )

    const delayMs = calculateRetryDelayMs(attempt, retryConfig)
    await sleep(delayMs)
  }

  return {
    success: false,
    error: lastError || 'Workflow node failed after retries',
  }
}
