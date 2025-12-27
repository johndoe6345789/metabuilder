import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { WorkflowRun, RepoInfo } from '../types'

const DEFAULT_REPO_LABEL = 'johndoe6345789/metabuilder'

export function useWorkflowRuns() {
  const [runs, setRuns] = useState<WorkflowRun[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastFetched, setLastFetched] = useState<Date | null>(null)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null)
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(30)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)

  const repoLabel = repoInfo ? `${repoInfo.owner}/${repoInfo.repo}` : DEFAULT_REPO_LABEL

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
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchRuns()
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [autoRefreshEnabled, fetchRuns])

  const toggleAutoRefresh = () => setAutoRefreshEnabled((prev) => !prev)

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'success.main'
      if (conclusion === 'failure') return 'error.main'
      if (conclusion === 'cancelled') return 'text.secondary'
    }
    return 'warning.main'
  }

  const conclusion = useMemo(() => {
    if (!runs || runs.length === 0) return null

    const total = runs.length
    const completed = runs.filter(r => r.status === 'completed').length
    const successful = runs.filter(r => r.status === 'completed' && r.conclusion === 'success').length
    const failed = runs.filter(r => r.status === 'completed' && r.conclusion === 'failure').length
    const cancelled = runs.filter(r => r.status === 'completed' && r.conclusion === 'cancelled').length
    const inProgress = runs.filter(r => r.status !== 'completed').length

    const mostRecent = runs[0]
    const mostRecentTimestamp = new Date(mostRecent.updated_at).getTime()
    const timeThreshold = 5 * 60 * 1000
    const recentWorkflows = runs.filter((run) => {
      const runTimestamp = new Date(run.updated_at).getTime()
      return mostRecentTimestamp - runTimestamp <= timeThreshold
    })

    const mostRecentPassed = recentWorkflows.every(
      (run) => run.status === 'completed' && run.conclusion === 'success',
    )
    const mostRecentFailed = recentWorkflows.some(
      (run) => run.status === 'completed' && run.conclusion === 'failure',
    )
    const mostRecentRunning = recentWorkflows.some((run) => run.status !== 'completed')

    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0
    let health: 'healthy' | 'warning' | 'critical' = 'healthy'
    if (failed / total > 0.3 || successRate < 60) {
      health = 'critical'
    } else if (failed > 0 || inProgress > 0) {
      health = 'warning'
    }

    return {
      total,
      completed,
      successful,
      failed,
      cancelled,
      inProgress,
      successRate,
      health,
      recentWorkflows,
      mostRecentPassed,
      mostRecentFailed,
      mostRecentRunning,
    }
  }, [runs])

  const summaryTone = useMemo(() => {
    if (!conclusion) return 'warning'
    if (conclusion.mostRecentPassed) return 'success'
    if (conclusion.mostRecentFailed) return 'error'
    return 'warning'
  }, [conclusion])

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
    getStatusColor,
    conclusion,
    summaryTone,
  }
}
