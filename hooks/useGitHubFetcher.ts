/**
 * useGitHubFetcher hook
 *
 * Generic hook for fetching GitHub workflow runs.
 * Accepts a fetcher function to decouple from specific implementations.
 */

import { useState, useEffect, useCallback } from 'react'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion?: string
  createdAt: string
}

export interface UseGitHubFetcherOptions {
  /**
   * Function to fetch workflow runs.
   * If not provided, the hook will not auto-fetch.
   */
  fetcher?: () => Promise<WorkflowRun[]>
  /**
   * Whether to fetch on mount. Defaults to true if fetcher is provided.
   */
  fetchOnMount?: boolean
}

export interface UseGitHubFetcherResult {
  runs: WorkflowRun[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useGitHubFetcher(options: UseGitHubFetcherOptions = {}): UseGitHubFetcherResult {
  const { fetcher, fetchOnMount = true } = options
  const [runs, setRuns] = useState<WorkflowRun[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!fetcher) {
      setError(new Error('No fetcher provided. Pass a fetcher function to useGitHubFetcher.'))
      return
    }

    setLoading(true)
    setError(null)
    try {
      const workflowRuns = await fetcher()
      setRuns(workflowRuns)
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (fetcher && fetchOnMount) {
      void refetch()
    }
  }, [fetcher, fetchOnMount, refetch])

  return {
    runs,
    loading,
    error,
    refetch,
  }
}
