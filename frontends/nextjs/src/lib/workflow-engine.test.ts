import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowEngine, createWorkflowEngine } from './workflow-engine'
import type { Workflow, WorkflowNode, LuaScript } from './level-types'

describe('workflow-engine', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = createWorkflowEngine()
  })

  describe('createWorkflowEngine', () => {
    it('should create a new WorkflowEngine instance', () => {
      const engine = createWorkflowEngine()
      expect(engine).toBeInstanceOf(WorkflowEngine)
    })
  })

  describe('executeWorkflow', () => {
    it.each([
      {
        name: 'simple trigger workflow',
        workflow: {
          id: 'w1',
          name: 'Simple Workflow',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
          ],
        } as Workflow,
        context: { data: { test: 'value' } },
        expected: {
          success: true,
          hasOutputs: true,
          outputCount: 1,
        },
      },
      {
        name: 'workflow with action node',
        workflow: {
          id: 'w2',
          name: 'Action Workflow',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'action', label: 'Process', config: { action: 'process' } },
          ],
        } as Workflow,
        context: { data: { value: 42 } },
        expected: {
          success: true,
          hasOutputs: true,
          outputCount: 2,
        },
      },
      {
        name: 'workflow with transform node',
        workflow: {
          id: 'w3',
          name: 'Transform Workflow',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'transform', label: 'Double', config: { transform: 'data.value * 2' } },
          ],
        } as Workflow,
        context: { data: { value: 5 } },
        expected: {
          success: true,
          hasOutputs: true,
          outputCount: 2,
        },
      },
    ])('should execute $name successfully', async ({ workflow, context, expected }) => {
      const result = await engine.executeWorkflow(workflow, context)

      expect(result.success).toBe(expected.success)
      expect(result.error).toBeUndefined()
      expect(Object.keys(result.outputs)).toHaveLength(expected.outputCount)
      expect(result.logs.length).toBeGreaterThan(0)
      expect(result.logs[0]).toContain(`Starting workflow: ${workflow.name}`)
    })

    it.each([
      {
        name: 'false condition stops execution',
        workflow: {
          id: 'w4',
          name: 'Condition Workflow',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'condition', label: 'Check', config: { condition: 'false' } },
            { id: 'n3', type: 'action', label: 'Never Run', config: {} },
          ],
        } as Workflow,
        context: { data: {} },
        expected: {
          success: true,
          outputCount: 2, // Only trigger and condition, not the action
          stoppedEarly: true,
        },
      },
      {
        name: 'true condition continues execution',
        workflow: {
          id: 'w5',
          name: 'Pass Condition',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'condition', label: 'Check', config: { condition: 'true' } },
            { id: 'n3', type: 'action', label: 'Should Run', config: {} },
          ],
        } as Workflow,
        context: { data: {} },
        expected: {
          success: true,
          outputCount: 3, // All nodes execute
          stoppedEarly: false,
        },
      },
      {
        name: 'data-based condition',
        workflow: {
          id: 'w6',
          name: 'Data Condition',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'condition', label: 'Check Value', config: { condition: 'data.value > 10' } },
          ],
        } as Workflow,
        context: { data: { value: 5 } },
        expected: {
          success: true,
          outputCount: 2,
          stoppedEarly: true,
        },
      },
    ])('should handle $name', async ({ workflow, context, expected }) => {
      const result = await engine.executeWorkflow(workflow, context)

      expect(result.success).toBe(expected.success)
      expect(Object.keys(result.outputs)).toHaveLength(expected.outputCount)
      
      if (expected.stoppedEarly) {
        expect(result.logs.some(log => log.includes('stopping workflow'))).toBe(true)
      }
    })

    it.each([
      {
        name: 'node with unknown type',
        workflow: {
          id: 'w7',
          name: 'Invalid Node',
          nodes: [
            { id: 'n1', type: 'unknown' as any, label: 'Bad Node', config: {} },
          ],
        } as Workflow,
        context: { data: {} },
        expectedError: 'Unknown node type',
      },
      {
        name: 'invalid condition syntax',
        workflow: {
          id: 'w8',
          name: 'Bad Condition',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'condition', label: 'Invalid', config: { condition: 'invalid syntax !' } },
          ],
        } as Workflow,
        context: { data: {} },
        expectedError: 'failed',
      },
      {
        name: 'invalid transform syntax',
        workflow: {
          id: 'w9',
          name: 'Bad Transform',
          nodes: [
            { id: 'n1', type: 'trigger', label: 'Start', config: {} },
            { id: 'n2', type: 'transform', label: 'Invalid', config: { transform: 'this is not valid javascript' } },
          ],
        } as Workflow,
        context: { data: {} },
        expectedError: 'Transform failed',
      },
    ])('should handle node error: $name', async ({ workflow, context, expectedError }) => {
      const result = await engine.executeWorkflow(workflow, context)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.toLowerCase()).toContain(expectedError.toLowerCase())
      expect(result.logs.length).toBeGreaterThan(0)
    })
  })

  describe('Lua node execution', () => {
    it.each([
      {
        name: 'simple Lua return',
        node: {
          id: 'n1',
          type: 'lua',
          label: 'Lua Node',
          config: { code: 'return 42' },
        } as WorkflowNode,
        data: {},
        expectedOutput: 42,
        expectedSuccess: true,
      },
      {
        name: 'Lua with data access',
        node: {
          id: 'n2',
          type: 'lua',
          label: 'Data Access',
          config: { code: 'return context.data.value * 2' },
        } as WorkflowNode,
        data: { value: 21 },
        expectedOutput: 42,
        expectedSuccess: true,
      },
      {
        name: 'Lua with default code',
        node: {
          id: 'n3',
          type: 'lua',
          label: 'Default',
          config: {},
        } as WorkflowNode,
        data: { test: 'value' },
        expectedOutput: { test: 'value' },
        expectedSuccess: true,
      },
    ])('should execute $name', async ({ node, data, expectedOutput, expectedSuccess }) => {
      const workflow: Workflow = {
        id: 'w-lua',
        name: 'Lua Test',
        nodes: [node],
      }

      const result = await engine.executeWorkflow(workflow, { data })

      expect(result.success).toBe(expectedSuccess)
      expect(result.outputs[node.id]).toEqual(expectedOutput)
    })

    it.each([
      {
        name: 'Lua with script reference',
        scripts: [
          { id: 'script1', name: 'Test Script', code: 'return 100', description: '' },
        ] as LuaScript[],
        node: {
          id: 'n1',
          type: 'lua',
          label: 'Script Ref',
          config: { scriptId: 'script1' },
        } as WorkflowNode,
        expectedOutput: 100,
      },
      {
        name: 'Lua with missing script',
        scripts: [] as LuaScript[],
        node: {
          id: 'n2',
          type: 'lua',
          label: 'Missing Script',
          config: { scriptId: 'nonexistent' },
        } as WorkflowNode,
        expectedError: 'Script not found',
      },
    ])('should handle $name', async ({ scripts, node, expectedOutput, expectedError }) => {
      const workflow: Workflow = {
        id: 'w-script',
        name: 'Script Test',
        nodes: [node],
      }

      const result = await engine.executeWorkflow(workflow, { data: {}, scripts })

      if (expectedError) {
        expect(result.success).toBe(false)
        expect(result.error).toContain(expectedError)
      } else {
        expect(result.success).toBe(true)
        expect(result.outputs[node.id]).toBe(expectedOutput)
      }
    })

    it.each([
      {
        name: 'syntax error',
        code: 'this is not valid lua !!',
        expectedError: true,
      },
      {
        name: 'runtime error',
        code: 'error("Intentional error")',
        expectedError: true,
      },
    ])('should handle Lua error: $name', async ({ code, expectedError }) => {
      const workflow: Workflow = {
        id: 'w-error',
        name: 'Error Test',
        nodes: [
          {
            id: 'n1',
            type: 'lua',
            label: 'Error Node',
            config: { code },
          },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.success).toBe(!expectedError)
      if (expectedError) {
        expect(result.error).toBeDefined()
      }
    })

    it('should capture Lua security warnings', async () => {
      // Test with code that might trigger security warnings
      const workflow: Workflow = {
        id: 'w-security',
        name: 'Security Test',
        nodes: [
          {
            id: 'n1',
            type: 'lua',
            label: 'Security Check',
            config: {
              code: `
                -- Attempting unsafe operations
                return 42
              `,
            },
          },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: {} })

      // Should still execute successfully due to sandbox
      expect(result.success).toBe(true)
      expect(result.securityWarnings).toBeDefined()
    })
  })

  describe('logging and context', () => {
    it('should capture logs from all nodes', async () => {
      const workflow: Workflow = {
        id: 'w-log',
        name: 'Log Test',
        nodes: [
          { id: 'n1', type: 'trigger', label: 'Start', config: {} },
          { id: 'n2', type: 'action', label: 'Action', config: { action: 'test' } },
          { id: 'n3', type: 'transform', label: 'Transform', config: { transform: '42' } },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.logs.length).toBeGreaterThan(0)
      expect(result.logs[0]).toContain('Starting workflow')
      expect(result.logs.some(log => log.includes('Executing node'))).toBe(true)
      expect(result.logs[result.logs.length - 1]).toContain('completed successfully')
    })

    it('should pass user context to nodes', async () => {
      const user = { id: 'user1', name: 'Test User' }
      const workflow: Workflow = {
        id: 'w-user',
        name: 'User Context',
        nodes: [
          {
            id: 'n1',
            type: 'lua',
            label: 'Get User',
            config: { code: 'return context.user.name' },
          },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: {}, user })

      expect(result.success).toBe(true)
      expect(result.outputs.n1).toBe('Test User')
    })
  })

  describe('complex workflow scenarios', () => {
    it('should execute multi-stage workflow with data flow', async () => {
      // Note: In this workflow, data flows through each node
      // n1: trigger passes through initial data
      // n2: transforms data.value to data.value + 10
      // n3: condition evaluates data > 50, passes through boolean (true)
      // n4: transforms data (now true/1) * 2 = 2
      const workflow: Workflow = {
        id: 'w-complex',
        name: 'Complex Workflow',
        nodes: [
          { id: 'n1', type: 'trigger', label: 'Start', config: {} },
          { id: 'n2', type: 'transform', label: 'Add 10', config: { transform: 'data.value + 10' } },
          { id: 'n3', type: 'condition', label: 'Check > 50', config: { condition: 'data > 50' } },
          { id: 'n4', type: 'transform', label: 'Double', config: { transform: 'data * 2' } },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: { value: 45 } })

      expect(result.success).toBe(true)
      expect(result.outputs.n2).toBe(55) // 45 + 10
      expect(result.outputs.n3).toBe(true) // 55 > 50
      // n4 receives `true` (JS coerces to 1) and multiplies by 2
      expect(result.outputs.n4).toBe(2) // true * 2 = 2
    })

    it('should handle workflow with early termination', async () => {
      const workflow: Workflow = {
        id: 'w-early',
        name: 'Early Stop',
        nodes: [
          { id: 'n1', type: 'trigger', label: 'Start', config: {} },
          { id: 'n2', type: 'condition', label: 'Always False', config: { condition: 'false' } },
          { id: 'n3', type: 'action', label: 'Never Runs', config: {} },
          { id: 'n4', type: 'action', label: 'Also Never Runs', config: {} },
        ],
      }

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.success).toBe(true)
      expect(Object.keys(result.outputs)).toHaveLength(2) // Only n1 and n2
      expect(result.outputs.n3).toBeUndefined()
      expect(result.outputs.n4).toBeUndefined()
    })
  })
})
