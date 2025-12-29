import { useMemo, useState } from 'react'

import type { Workflow } from '@/lib/level-types'
import type { WorkflowExecutionResult } from '@/lib/workflow/engine/workflow-engine'

import { DEFAULT_TEST_DATA } from './constants'
import type { WorkflowSelection, WorkflowState, WorkflowStateSetters } from './types'

export const useWorkflowState = (
  workflows: Workflow[]
): WorkflowState & WorkflowStateSetters & WorkflowSelection => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    workflows.length > 0 ? workflows[0].id : null
  )
  const [testData, setTestData] = useState<string>(DEFAULT_TEST_DATA)
  const [testOutput, setTestOutput] = useState<WorkflowExecutionResult | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)

  const currentWorkflow = useMemo(
    () => workflows.find(({ id }) => id === selectedWorkflowId),
    [workflows, selectedWorkflowId]
  )

  return {
    selectedWorkflowId,
    setSelectedWorkflowId,
    testData,
    setTestData,
    testOutput,
    setTestOutput,
    isExecuting,
    setIsExecuting,
    currentWorkflow,
  }
}
