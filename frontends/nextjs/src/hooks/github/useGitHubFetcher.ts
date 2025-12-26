import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Octokit } from 'octokit'

export interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_branch: string
  event: string
}

interface UseGitHubFetcherState {
  data: WorkflowRun[] | null
  isLoading: boolean
  error: string | null
  lastFetched: Date | null
}

interface UseGitHubFetcherActions {
  fetch: () => Promise<void>
  retry: () => Promise<void>
  reset: () => void
}

/**
 * Hook to manage GitHub workflow run fetching
 * Separates API logic from UI concerns
 */
export function useGitHubFetcher(): UseGitHubFetcherState & UseGitHubFetcherActions {
  const [data, setData] = useState<WorkflowRun[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)

  const fetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('github_token')
      if (!token) {
        throw new Error('GitHub token not found. Please authenticate.')
      }

      const octokit = new Octokit({ auth: token })
      const response = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner: 'johndoe6345789',
        repo: 'metabuilder',
        per_page: 10,
      })

      setData(response.data.workflow_runs as WorkflowRun[])
      setLastFetched(new Date())
      toast.success('Workflow runs loaded successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch workflow runs'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const retry = useCallback(() => fetch(), [fetch])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLastFetched(null)
  }, [])

  return {
    data,
    isLoading,
    error,
    lastFetched,
    fetch,
    retry,
    reset,
  }
}
