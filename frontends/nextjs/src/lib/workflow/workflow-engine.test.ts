import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowEngine, createWorkflowEngine } from './workflow-engine'
import type { Workflow, WorkflowNode, LuaScript } from '../types/level-types'

// Helper to create a minimal valid WorkflowNode
function createNode(
  id: string,
  type: WorkflowNode['type'],
  label: string,
  config: Record<string, any> = {}
): WorkflowNode {
  return { id, type, label, config, position: { x: 0, y: 0 } }
}

// Helper to create a minimal valid Workflow
function createWorkflow(
  id: string,
  name: string,
  nodes: WorkflowNode[]
): Workflow {
  return { id, name, nodes, edges: [], enabled: true }
}

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
        workflow: createWorkflow('w1', 'Simple Workflow', [
          createNode('n1', 'trigger', 'Start'),
        ]),
        context: { data: { test: 'value' } },
        expected: {
          success: true,
          hasOutputs: true,
          outputCount: 1,
        },
      },
      {
        name: 'workflow with action node',
        workflow: createWorkflow('w2', 'Action Workflow', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'action', 'Process', { action: 'process' }),
        ]),
        context: { data: { value: 42 } },
        expected: {
          success: true,
          hasOutputs: true,
          outputCount: 2,
        },
      },
      {
        name: 'workflow with transform node',
        workflow: createWorkflow('w3', 'Transform Workflow', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'transform', 'Double', { transform: 'data.value * 2' }),
        ]),
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
        workflow: createWorkflow('w4', 'Condition Workflow', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'condition', 'Check', { condition: 'false' }),
          createNode('n3', 'action', 'Never Run'),
        ]),
        context: { data: {} },
        expected: {
          success: true,
          outputCount: 2, // Only trigger and condition, not the action
          stoppedEarly: true,
        },
      },
      {
        name: 'true condition continues execution',
        workflow: createWorkflow('w5', 'Pass Condition', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'condition', 'Check', { condition: 'true' }),
          createNode('n3', 'action', 'Should Run'),
        ]),
        context: { data: {} },
        expected: {
          success: true,
          outputCount: 3, // All nodes execute
          stoppedEarly: false,
        },
      },
      {
        name: 'data-based condition',
        workflow: createWorkflow('w6', 'Data Condition', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'condition', 'Check Value', { condition: 'data.value > 10' }),
        ]),
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
        workflow: createWorkflow('w7', 'Invalid Node', [
          createNode('n1', 'unknown' as any, 'Bad Node'),
        ]),
        context: { data: {} },
        expectedError: 'Unknown node type',
      },
      {
        name: 'invalid condition syntax',
        workflow: createWorkflow('w8', 'Bad Condition', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'condition', 'Invalid', { condition: 'invalid syntax !' }),
        ]),
        context: { data: {} },
        expectedError: 'failed',
      },
      {
        name: 'invalid transform syntax',
        workflow: createWorkflow('w9', 'Bad Transform', [
          createNode('n1', 'trigger', 'Start'),
          createNode('n2', 'transform', 'Invalid', { transform: 'this is not valid javascript' }),
        ]),
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
        node: createNode('n1', 'lua', 'Lua Node', { code: 'return 42' }),
        data: {},
        expectedOutput: 42,
        expectedSuccess: true,
      },
      {
        name: 'Lua with data access',
        node: createNode('n2', 'lua', 'Data Access', { code: 'return context.data.value * 2' }),
        data: { value: 21 },
        expectedOutput: 42,
        expectedSuccess: true,
      },
      {
        name: 'Lua with default code',
        node: createNode('n3', 'lua', 'Default'),
        data: { test: 'value' },
        expectedOutput: { test: 'value' },
        expectedSuccess: true,
      },
    ])('should execute $name', async ({ node, data, expectedOutput, expectedSuccess }) => {
      const workflow = createWorkflow('w-lua', 'Lua Test', [node])

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
        node: createNode('n1', 'lua', 'Script Ref', { scriptId: 'script1' }),
        expectedOutput: 100,
      },
      {
        name: 'Lua with missing script',
        scripts: [] as LuaScript[],
        node: createNode('n2', 'lua', 'Missing Script', { scriptId: 'nonexistent' }),
        expectedError: 'Script not found',
      },
    ])('should handle $name', async ({ scripts, node, expectedOutput, expectedError }) => {
      const workflow = createWorkflow('w-script', 'Script Test', [node])

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
      const workflow = createWorkflow('w-error', 'Error Test', [
        createNode('n1', 'lua', 'Error Node', { code }),
      ])

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.success).toBe(!expectedError)
      if (expectedError) {
        expect(result.error).toBeDefined()
      }
    })

    it('should capture Lua security warnings', async () => {
      // Test with code that might trigger security warnings
      const workflow = createWorkflow('w-security', 'Security Test', [
        createNode('n1', 'lua', 'Security Check', {
          code: `
            -- Attempting unsafe operations
            return 42
          `,
        }),
      ])

      const result = await engine.executeWorkflow(workflow, { data: {} })

      // Should still execute successfully due to sandbox
      expect(result.success).toBe(true)
      expect(result.securityWarnings).toBeDefined()
    })
  })

  describe('logging and context', () => {
    it('should capture logs from all nodes', async () => {
      const workflow = createWorkflow('w-log', 'Log Test', [
        createNode('n1', 'trigger', 'Start'),
        createNode('n2', 'action', 'Action', { action: 'test' }),
        createNode('n3', 'transform', 'Transform', { transform: '42' }),
      ])

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.logs.length).toBeGreaterThan(0)
      expect(result.logs[0]).toContain('Starting workflow')
      expect(result.logs.some(log => log.includes('Executing node'))).toBe(true)
      expect(result.logs[result.logs.length - 1]).toContain('completed successfully')
    })

    it('should pass user context to nodes', async () => {
      const user = { id: 'user1', name: 'Test User' }
      const workflow = createWorkflow('w-user', 'User Context', [
        createNode('n1', 'lua', 'Get User', { code: 'return context.user.name' }),
      ])

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
      const workflow = createWorkflow('w-complex', 'Complex Workflow', [
        createNode('n1', 'trigger', 'Start'),
        createNode('n2', 'transform', 'Add 10', { transform: 'data.value + 10' }),
        createNode('n3', 'condition', 'Check > 50', { condition: 'data > 50' }),
        createNode('n4', 'transform', 'Double', { transform: 'data * 2' }),
      ])

      const result = await engine.executeWorkflow(workflow, { data: { value: 45 } })

      expect(result.success).toBe(true)
      expect(result.outputs.n2).toBe(55) // 45 + 10
      expect(result.outputs.n3).toBe(true) // 55 > 50
      // n4 receives `true` (JS coerces to 1) and multiplies by 2
      expect(result.outputs.n4).toBe(2) // true * 2 = 2
    })

    it('should handle workflow with early termination', async () => {
      const workflow = createWorkflow('w-early', 'Early Stop', [
        createNode('n1', 'trigger', 'Start'),
        createNode('n2', 'condition', 'Always False', { condition: 'false' }),
        createNode('n3', 'action', 'Never Runs'),
        createNode('n4', 'action', 'Also Never Runs'),
      ])

      const result = await engine.executeWorkflow(workflow, { data: {} })

      expect(result.success).toBe(true)
      expect(Object.keys(result.outputs)).toHaveLength(2) // Only n1 and n2
      expect(result.outputs.n3).toBeUndefined()
      expect(result.outputs.n4).toBeUndefined()
    })
  })
})
