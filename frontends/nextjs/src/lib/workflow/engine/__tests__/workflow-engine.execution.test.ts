import { beforeEach, describe, expect, it } from 'vitest'

import { createWorkflowEngine, WorkflowEngine } from '../workflow-engine'
import { createContext, createNode, createWorkflow } from './workflow-engine.fixtures'

describe('workflow-engine execution', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = createWorkflowEngine()
  })

  it('executes nodes sequentially and returns aggregated outputs', async () => {
    const workflow = createWorkflow('exec-1', 'Sequential run', [
      createNode('trigger', 'trigger', 'Start trigger'),
      createNode('transform', 'transform', 'Add one', { transform: 'data.value + 1' }),
      createNode('action', 'action', 'Echo'),
    ])

    const result = await engine.executeWorkflow(workflow, createContext({ value: 5 }))

    expect(result.success).toBe(true)
    expect(result.outputs.trigger).toEqual({ value: 5 })
    expect(result.outputs.transform).toBe(6)
    expect(result.outputs.action).toBe(6)
    expect(result.logs.at(-1)).toContain('Workflow completed successfully')
  })

  it('stops execution after a false condition while keeping prior outputs', async () => {
    const workflow = createWorkflow('exec-2', 'Early stop', [
      createNode('trigger', 'trigger', 'Start trigger'),
      createNode('condition', 'condition', 'Stopper', { condition: 'false' }),
      createNode('action', 'action', 'Should not run'),
    ])

    const result = await engine.executeWorkflow(workflow, createContext({}))

    expect(result.success).toBe(true)
    expect(result.outputs.action).toBeUndefined()
    expect(Object.keys(result.outputs)).toHaveLength(2)
    expect(result.logs.some(log => log.includes('Condition node returned false'))).toBe(true)
  })

  it('passes user context through to Lua nodes', async () => {
    const workflow = createWorkflow('exec-3', 'Lua context', [
      createNode('lua', 'lua', 'User echo', { code: 'return context.user.id' }),
    ])

    const context = createContext({}, { user: { id: 'user-123' } })
    const result = await WorkflowEngine.execute(workflow, context)

    expect(result.success).toBe(true)
    expect(result.outputs.lua).toBe('user-123')
    expect(result.logs[0]).toContain('Starting workflow: Lua context')
  })
})
