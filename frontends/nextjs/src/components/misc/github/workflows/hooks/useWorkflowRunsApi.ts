import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { RepoInfo, WorkflowRun } from '../../types'

const DEFAULT_REPO_LABEL = 'johndoe6345789/metabuilder'

export function useWorkflowRunsApi() {
  const [runs, setRuns] = useState<WorkflowRun[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const repoLabel = useMemo(
    () => (repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : DEFAULT_REPO_LABEL),
    [repoInfo]
  )

  const fetchRuns = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setNeedsAuth(false)

    try {
      const response = await fetch('/api/github/actions/runs', { cache: 'no-store' })
      let payload: {
        owner?: string
        repo?: string
        runs?: WorkflowRun[]
        fetchedAt?: string
        requiresAuth?: boolean
        error?: string
      } | null = null

      try {
        payload = await response.json()
      } catch {
        payload = null
      }

      if (!response.ok) {
        if (payload?.requiresAuth) {
          setNeedsAuth(true)
        }
        const message = payload?.error || `Failed to fetch workflow runs (${response.status})`
        throw new Error(message)
      }

      const retrievedRuns = payload?.runs || []
      setRuns(retrievedRuns)
      if (payload?.owner && payload?.repo) {
        setRepoInfo({ owner: payload.owner, repo: payload.repo })
      }
      setLastFetched(payload?.fetchedAt ? new Date(payload.fetchedAt) : new Date())
      setSecondsUntilRefresh(30)
      toast.success(`Fetched ${retrievedRuns.length} workflow runs`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      toast.error(`Failed to fetch: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRuns()
  }, [fetchRuns])

  useEffect(() => {
    if (!autoRefreshEnabled) return

    const countdownInterval = setInterval(() => {
      setSecondsUntilRefresh(prev => {
        if (prev <= 1) {
          fetchRuns()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [autoRefreshEnabled, fetchRuns])

  const toggleAutoRefresh = () => setAutoRefreshEnabled(prev => !prev)

  return {
    runs,
    isLoading,
    error,
    lastFetched,
    needsAuth,
    repoInfo,
    repoLabel,
    secondsUntilRefresh,
    autoRefreshEnabled,
    toggleAutoRefresh,
    fetchRuns,
  }
}
