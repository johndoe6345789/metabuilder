import type { LuaScript, Workflow, WorkflowNode } from '@/lib/level-types'
import type { WorkflowExecutionResult } from '@/lib/workflow/engine/workflow-engine'

export interface WorkflowEditorProps {
  workflows: Workflow[]
  onWorkflowsChange: (workflows: Workflow[]) => void
  scripts?: LuaScript[]
}

export interface WorkflowState {
  selectedWorkflowId: string | null
  testData: string
  testOutput: WorkflowExecutionResult | null
  isExecuting: boolean
}

export interface WorkflowStateSetters {
  setSelectedWorkflowId: (id: string | null) => void
  setTestData: (data: string) => void
  setTestOutput: (result: WorkflowExecutionResult | null) => void
  setIsExecuting: (isExecuting: boolean) => void
}

export interface WorkflowSelection {
  currentWorkflow: Workflow | undefined
}

export interface WorkflowActionHandlers {
  handleAddWorkflow: () => void
  handleDeleteWorkflow: (workflowId: string) => void
  handleUpdateWorkflow: (updates: Partial<Workflow>) => void
  handleAddNode: (type: WorkflowNode['type']) => void
  handleDeleteNode: (nodeId: string) => void
  handleUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
  handleTestWorkflow: () => Promise<void>
}

export interface WorkflowSidebarProps {
  workflows: Workflow[]
  selectedWorkflowId: string | null
  onSelectWorkflow: (id: string) => void
  onAddWorkflow: () => void
  onDeleteWorkflow: (id: string) => void
}

export interface WorkflowDetailsPanelProps {
  workflow: Workflow
  onUpdate: (updates: Partial<Workflow>) => void
}

export interface WorkflowNodesPanelProps {
  workflow: Workflow
  scripts: LuaScript[]
  onAddNode: (type: WorkflowNode['type']) => void
  onDeleteNode: (nodeId: string) => void
  onUpdateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void
}

export interface WorkflowTesterProps {
  workflow: Workflow
  testData: string
  testOutput: WorkflowExecutionResult | null
  onTestDataChange: (value: string) => void
}

export interface NodeTypeOption {
  type: WorkflowNode['type']
  label: string
}
