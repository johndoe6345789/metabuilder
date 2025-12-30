import { describe, expect, it } from 'vitest'

import type { WorkflowNode } from '../../../types/level-types'
import { WorkflowEngine } from '../workflow-engine'
import { createContext, createNode, createWorkflow } from './workflow-engine.fixtures'

describe('workflow-engine errors', () => {
  it('fails unknown node types with a clear error', async () => {
    const invalidType = 'unknown' as WorkflowNode['type']
    const workflow = createWorkflow('err-1', 'Unknown node', [
      createNode('mystery', invalidType, 'Mystery node'),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({}))

    expect(result.success).toBe(false)
    expect(result.error).toContain('Unknown node type')
  })

  it('reports condition evaluation failures', async () => {
    const workflow = createWorkflow('err-2', 'Bad condition', [
      createNode('trigger', 'trigger', 'Start trigger'),
      createNode('condition', 'condition', 'Broken', {
        condition: '(() => { throw new Error("nope") })()',
      }),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({}))

    expect(result.success).toBe(false)
    expect(result.error).toContain('Condition evaluation failed')
    expect(result.outputs.trigger).toEqual({})
  })

  it('stops after configured retries when a node keeps failing', async () => {
    const workflow = createWorkflow('err-3', 'Retry failure', [
      createNode('trigger', 'trigger', 'Start trigger'),
      createNode('retry', 'transform', 'Keep failing', {
        retry: { maxAttempts: 2, delayMs: 0 },
        transform: '(() => { throw new Error("still failing") })()',
      }),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({ data: 1 }))

    expect(result.success).toBe(false)
    expect(result.error).toContain('Transform failed')
    expect(result.logs.filter(log => log.includes('Retrying node'))).toHaveLength(1)
  })

  it('propagates Lua script resolution errors', async () => {
    const workflow = createWorkflow('err-4', 'Missing script', [
      createNode('lua', 'lua', 'Lookup', { scriptId: 'missing-script' }),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({}, { scripts: [] }))

    expect(result.success).toBe(false)
    expect(result.error).toContain('Script not found: missing-script')
  })
})
