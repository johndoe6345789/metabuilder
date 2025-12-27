import { useWorkflowRunsApi } from './useWorkflowRunsApi'
import { useWorkflowRunsSelectors } from './useWorkflowRunsSelectors'

export function useWorkflowRuns() {
  const api = useWorkflowRunsApi()
  const selectors = useWorkflowRunsSelectors(api.runs)

  return {
    ...api,
    ...selectors,
  }
}
