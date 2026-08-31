declare module '@metabuilder/workflow' {
  export interface WorkflowVariable {
    name: string
    description?: string
    type?: string
    defaultValue?: unknown
    required?: boolean
    scope?: string
    [key: string]: any
  }

  export interface ConnectionTarget {
    node: string
    type: 'main' | 'error' | 'condition'
    index: number
    conditional?: boolean
    condition?: string
  }

  export interface WorkflowNode {
    id: string
    name: string
    description?: string
    type?: string
    typeVersion?: number
    nodeType: string
    position: [number, number]
    size?: [number, number]
    parameters: Record<string, unknown>
    inputs?: unknown[]
    outputs?: unknown[]
    credentials?: Record<string, CredentialRef>
    disabled?: boolean
    notes?: string
    metadata?: Record<string, unknown>
    [key: string]: any
  }

  export interface WorkflowTrigger {
    nodeId: string
    kind: string
    enabled: boolean
    metadata: Record<string, unknown>
    [key: string]: any
  }
}
