import { useAppDispatch, useAppSelector } from '@/store'
import { addWorkflow as addWorkflowAction, updateWorkflow as updateWorkflowAction, removeWorkflow, setWorkflows } from '@/store/slices/workflowsSlice'
import { useCallback } from 'react'
import { Workflow } from '@/types/project'

export function useWorkflows() {
  const dispatch = useAppDispatch()
  const sliceWorkflows = useAppSelector((s) => s.workflows?.workflows ?? [])
  const workflows = sliceWorkflows as unknown as Workflow[]
  
  const addWorkflow = useCallback((workflow: Workflow) => {
    dispatch(addWorkflowAction(workflow as any))
  }, [dispatch])
  
  const updateWorkflow = useCallback((workflowId: string, updates: Partial<Workflow>) => {
    const existing = workflows.find(w => w.id === workflowId)
    if (existing) {
      dispatch(updateWorkflowAction({ ...existing, ...updates } as any))
    }
  }, [dispatch, workflows])
  
  const deleteWorkflow = useCallback((workflowId: string) => {
    dispatch(removeWorkflow(workflowId))
  }, [dispatch])
  
  const getWorkflow = useCallback((workflowId: string) => {
    return workflows.find(w => w.id === workflowId)
  }, [workflows])
  
  return {
    workflows,
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    getWorkflow,
  }
}
