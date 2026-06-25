/**
 * useGitHubFetcher - Generic GitHub API fetcher hook
 *
 * Provides a simple interface for fetching GitHub data without being tied to specific services.
 * Supports custom fetch functions for different GitHub API endpoints.
 */

import { useState, useEffect, useCallback } from 'react'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion?: string
  createdAt: string
}

export interface UseGitHubFetcherOptions<T> {
  /**
   * Function to fetch data from GitHub
   * Should handle authentication and API calls
   */
  fetchFn?: () => Promise<T>

  /**
   * Interval for auto-refetching in milliseconds
   * @default 30000
   */
  refetchInterval?: number

  /**
   * Whether to refetch on component mount
   * @default true
   */
  autoRefetch?: boolean
}

export interface UseGitHubFetcherResult<T> {
  /**
   * The fetched data
   */
  data: T[]

  /**
   * Whether data is currently loading
   */
  loading: boolean

  /**
   * Error that occurred, if any
   */
  error: Error | null

  /**
   * Manually trigger a refetch
   */
  refetch: () => Promise<void>
}

/**
 * useGitHubFetcher - Manage GitHub API data fetching
 *
 * @template T Type of data being fetched from GitHub
 * @param options Configuration options
 * @returns GitHub data with loading state
 *
 * @example
 * ```tsx
 * // For workflow runs
 * const { data: runs, loading, error, refetch } = useGitHubFetcher<WorkflowRun>({
 *   fetchFn: async () => {
 *     const client = getGitHubClient()
 *     return client.listWorkflowRuns({ owner: 'org', repo: 'repo' })
 *   }
 * })
 *
 * // For pull requests
 * const { data: prs, loading, error } = useGitHubFetcher<PullRequest>({
 *   fetchFn: async () => {
 *     return fetch('/api/github/pulls').then(r => r.json())
 *   },
 *   refetchInterval: 60000
 * })
 * ```
 */
export function useGitHubFetcher<T = unknown>(
  options: UseGitHubFetcherOptions<T[]> = {}
): UseGitHubFetcherResult<T> {
  const { fetchFn, refetchInterval = 30000, autoRefetch = true } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refetch = useCallback(async () => {
    if (!fetchFn) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  // Initial fetch
  useEffect(() => {
    if (autoRefetch) {
      void refetch()
    }
  }, [refetch, autoRefetch])

  // Auto-refetch on interval
  useEffect(() => {
    if (!refetchInterval || refetchInterval <= 0 || !fetchFn) {
      return
    }

    const interval = setInterval(() => {
      void refetch()
    }, refetchInterval)

    return () => clearInterval(interval)
  }, [refetchInterval, fetchFn, refetch])

  return {
    data,
    loading,
    error,
    refetch,
  }
}

/**
 * Default workflow-specific fetcher
 * Use this directly if you have a specific workflow API function
 *
 * @example
 * ```tsx
 * const { data: runs, loading } = useWorkflowFetcher(
 *   async () => {
 *     const { listWorkflowRuns } = await import('@/lib/github/workflows')
 *     return listWorkflowRuns({ owner: 'org', repo: 'repo' })
 *   }
 * )
 * ```
 */
export function useWorkflowFetcher(
  fetchFn: () => Promise<WorkflowRun[]>,
  refetchInterval?: number
): UseGitHubFetcherResult<WorkflowRun> {
  return useGitHubFetcher<WorkflowRun>({
    fetchFn,
    refetchInterval,
  })
}
