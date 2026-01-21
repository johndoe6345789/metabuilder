import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'
import { Workflow } from '@/types/project'

export function useWorkflows() {
  const [workflows, setWorkflows] = useKV<Workflow[]>('project-workflows', [])
  
  const addWorkflow = useCallback((workflow: Workflow) => {
    setWorkflows(current => [...(current || []), workflow])
  }, [setWorkflows])
  
  const updateWorkflow = useCallback((workflowId: string, updates: Partial<Workflow>) => {
    setWorkflows(current =>
      (current || []).map(w => w.id === workflowId ? { ...w, ...updates } : w)
    )
  }, [setWorkflows])
  
  const deleteWorkflow = useCallback((workflowId: string) => {
    setWorkflows(current => (current || []).filter(w => w.id !== workflowId))
  }, [setWorkflows])
  
  const getWorkflow = useCallback((workflowId: string) => {
    return workflows?.find(w => w.id === workflowId)
  }, [workflows])
  
  return {
    workflows: workflows || [],
    addWorkflow,
    updateWorkflow,
    deleteWorkflow,
    getWorkflow,
  }
}
