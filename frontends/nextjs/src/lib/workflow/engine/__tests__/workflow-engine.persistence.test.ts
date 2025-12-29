import { afterEach, describe, expect, it, vi } from 'vitest'
import { WorkflowEngine } from '../workflow-engine'
import { createContext, createNode, createWorkflow } from './workflow-engine.fixtures'
import * as SandboxFactory from '../../../lua/engine/sandbox/create-sandboxed-lua-engine'
import type { SandboxedLuaResult } from '../../../lua/engine/sandbox/sandboxed-lua-engine'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('workflow-engine persistence', () => {
  it('returns accumulated outputs and logs when a node fails', async () => {
    const workflow = createWorkflow('persist-1', 'Failure keeps history', [
      createNode('trigger', 'trigger', 'Start trigger'),
      createNode('transform', 'transform', 'Break here', {
        transform: '(() => { throw new Error("boom"); })()',
      }),
      createNode('action', 'action', 'Should not run'),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({ value: 3 }))

    expect(result.success).toBe(false)
    expect(result.outputs.trigger).toEqual({ value: 3 })
    expect(result.outputs.action).toBeUndefined()
    expect(result.logs.some(log => log.includes('Break here'))).toBe(true)
    expect(result.error).toContain('Transform failed')
  })

  it('persists security warnings from Lua execution', async () => {
    const sandboxResult: SandboxedLuaResult = {
      execution: { success: true, result: 99, logs: ['lua log'] },
      security: { severity: 'high', issues: [{ message: 'uses os' }] } as any,
    }

    const mockEngine = {
      executeWithSandbox: vi.fn(async () => sandboxResult),
      destroy: vi.fn(),
    }

    vi.spyOn(SandboxFactory, 'createSandboxedLuaEngine').mockReturnValue(mockEngine as any)

    const workflow = createWorkflow('persist-2', 'Lua security', [
      createNode('lua', 'lua', 'Sandboxed', { code: 'return 1' }),
    ])

    const result = await WorkflowEngine.execute(workflow, createContext({}))

    expect(result.success).toBe(true)
    expect(result.outputs.lua).toBe(99)
    expect(result.securityWarnings).toContain('Security issues detected: uses os')
    expect(result.logs.some(log => log.includes('[Lua] lua log'))).toBe(true)
    expect(mockEngine.destroy).toHaveBeenCalled()
  })
})
