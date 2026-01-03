/**
 * Hook for fetching GitHub Actions workflow data
 */
import { useState, useEffect } from 'react'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
}

export interface UseGitHubFetcherReturn {
  runs: WorkflowRun[]
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useGitHubFetcher(
  owner?: string,
  repo?: string,
  autoRefresh = false
): UseGitHubFetcherReturn {
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchRuns = async () => {
    if (!owner || !repo) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/github/actions/runs?owner=${owner}&repo=${repo}`)
      if (!response.ok) throw new Error('Failed to fetch workflow runs')
      const data = await response.json()
      setRuns(data.workflow_runs || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRuns()
  }, [owner, repo])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchRuns, 30000)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, owner, repo])

  return {
    runs,
    isLoading,
    error,
    refresh: fetchRuns,
  }
}
