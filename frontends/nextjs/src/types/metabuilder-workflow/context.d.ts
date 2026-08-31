declare module '@metabuilder/workflow' {
  export interface WorkflowContext {
    executionId: string
    tenantId: string
    userId: string
    trigger: WorkflowTrigger
    triggerData?: Record<string, unknown>
    variables: Record<string, unknown>
    secrets: Record<string, string>
    user: {
      id: string
      email: string
      level: number
      role?: string
      [key: string]: unknown
    }
    request?: Record<string, unknown>
    metadata?: Record<string, unknown>
    [key: string]: unknown
  }

  export type BuiltInNodeType = string

  export interface INodeExecutor {
    execute: (
      context: WorkflowContext,
      node: WorkflowNode
    ) => Promise<NodeResult>
  }
}
