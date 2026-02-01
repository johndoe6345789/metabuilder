/**
 * useGitHubFetcher hook
 */

import { useState, useEffect, useCallback } from 'react'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion?: string
  createdAt: string
}

export function useGitHubFetcher() {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { listWorkflowRuns } = await import('@/lib/github/workflows/listing/list-workflow-runs')
      // TODO: Get owner/repo from environment or context
      const workflowRuns = await listWorkflowRuns({ client: null, owner: 'owner', repo: 'repo' })
      setRuns(workflowRuns)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return {
    runs,
    loading,
    error,
    refetch,
  }
}
