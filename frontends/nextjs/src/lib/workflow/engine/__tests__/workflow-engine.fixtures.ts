import type { Workflow, WorkflowNode } from '../../../types/level-types'
import type { WorkflowExecutionContext } from '../../workflow-execution-context'

export function createNode(
  id: string,
  type: WorkflowNode['type'],
  label: string,
  config: Record<string, any> = {}
): WorkflowNode {
  return { id, type, label, config, position: { x: 0, y: 0 } }
}

export function createWorkflow(id: string, name: string, nodes: WorkflowNode[]): Workflow {
  return { id, name, nodes, edges: [], enabled: true }
}

export function createContext(
  data: any = {},
  overrides: Partial<WorkflowExecutionContext> = {}
): WorkflowExecutionContext {
  return { data, ...overrides }
}
