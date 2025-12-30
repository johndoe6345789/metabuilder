import { toast } from 'sonner'

import type { LuaScript, Workflow, WorkflowNode } from '@/lib/level-types'
import type { WorkflowExecutionResult } from '@/lib/workflow/engine/workflow-engine'
import { createWorkflowEngine } from '@/lib/workflow/engine/workflow-engine'
import type { JsonValue } from '@/types/utility-types'

import type { WorkflowActionHandlers, WorkflowStateSetters } from './types'

interface WorkflowActionDependencies extends WorkflowStateSetters {
  workflows: Workflow[]
  currentWorkflow: Workflow | undefined
  onWorkflowsChange: (workflows: Workflow[]) => void
  scripts: LuaScript[]
  testData: string
}

export const createActionHandlers = ({
  workflows,
  currentWorkflow,
  onWorkflowsChange,
  setSelectedWorkflowId,
  setTestOutput,
  setIsExecuting,
  scripts,
  testData,
}: WorkflowActionDependencies): WorkflowActionHandlers => {
  const handleAddWorkflow = () => {
    const newWorkflow: Workflow = {
      id: `workflow_${Date.now()}`,
      name: 'New Workflow',
      nodes: [],
      edges: [],
      enabled: true,
    }
    onWorkflowsChange([...workflows, newWorkflow])
    setSelectedWorkflowId(newWorkflow.id)
    toast.success('Workflow created')
  }

  const handleDeleteWorkflow = (workflowId: string) => {
    onWorkflowsChange(workflows.filter(w => w.id !== workflowId))
    if (currentWorkflow?.id === workflowId) {
      setSelectedWorkflowId(workflows.length > 1 ? workflows[0].id : null)
    }
    toast.success('Workflow deleted')
  }

  const handleUpdateWorkflow = (updates: Partial<Workflow>) => {
    if (!currentWorkflow) return

    onWorkflowsChange(workflows.map(w => (w.id === currentWorkflow.id ? { ...w, ...updates } : w)))
  }

  const handleAddNode = (type: WorkflowNode['type']) => {
    if (!currentWorkflow) return

    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      config: {},
      position: { x: 100, y: currentWorkflow.nodes.length * 100 + 100 },
    }

    handleUpdateWorkflow({ nodes: [...currentWorkflow.nodes, newNode] })
    toast.success('Node added')
  }

  const handleDeleteNode = (nodeId: string) => {
    if (!currentWorkflow) return
    handleUpdateWorkflow({
      nodes: currentWorkflow.nodes.filter(n => n.id !== nodeId),
      edges: currentWorkflow.edges.filter(e => e.source !== nodeId && e.target !== nodeId),
    })
    toast.success('Node deleted')
  }

  const handleUpdateNode = (nodeId: string, updates: Partial<WorkflowNode>) => {
    if (!currentWorkflow) return
    handleUpdateWorkflow({
      nodes: currentWorkflow.nodes.map(n => (n.id === nodeId ? { ...n, ...updates } : n)),
    })
  }

  const handleTestWorkflow = async () => {
    if (!currentWorkflow) return

    setIsExecuting(true)
    setTestOutput(null)

    try {
      let parsedData: JsonValue
      try {
        parsedData = JSON.parse(testData) as JsonValue
      } catch {
        parsedData = testData
      }

      const engine = createWorkflowEngine()
      const result = (await engine.executeWorkflow(currentWorkflow, {
        data: parsedData,
        user: { username: 'test_user', role: 'god' },
        scripts,
      })) as WorkflowExecutionResult

      setTestOutput(result)

      if (result.success) {
        toast.success('Workflow executed successfully')
      } else {
        toast.error('Workflow execution failed')
      }
    } catch (error) {
      toast.error('Execution error: ' + (error instanceof Error ? error.message : String(error)))
      setTestOutput({
        success: false,
        outputs: {},
        logs: [],
        error: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    handleAddWorkflow,
    handleDeleteWorkflow,
    handleUpdateWorkflow,
    handleAddNode,
    handleDeleteNode,
    handleUpdateNode,
    handleTestWorkflow,
  }
}
