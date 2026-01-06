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
      const workflowRuns = await listWorkflowRuns()
      setRuns(workflowRuns)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return {
    runs,
    loading,
    error,
    refetch,
  }
}
}
