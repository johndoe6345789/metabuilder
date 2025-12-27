import { useCallback, useMemo } from 'react'

import { WorkflowRun } from '../../types'

const TIME_THRESHOLD_MS = 5 * 60 * 1000

type PipelineHealth = 'healthy' | 'warning' | 'critical'

type PipelineSummary = {
  total: number
  completed: number
  successful: number
  failed: number
  cancelled: number
  inProgress: number
  successRate: number
  health: PipelineHealth
  recentWorkflows: WorkflowRun[]
  mostRecentPassed: boolean
  mostRecentFailed: boolean
  mostRecentRunning: boolean
}

type SummaryTone = 'success' | 'error' | 'warning'

export const useWorkflowRunsSelectors = (runs: WorkflowRun[] | null) => {
  const getStatusColor = useCallback((status: string, conclusion: string | null) => {
    if (status === 'completed') {
      if (conclusion === 'success') return 'success.main'
      if (conclusion === 'failure') return 'error.main'
      if (conclusion === 'cancelled') return 'text.secondary'
    }
    return 'warning.main'
  }, [])

  const conclusion = useMemo<PipelineSummary | null>(() => {
    if (!runs || runs.length === 0) return null

    const total = runs.length
    const completed = runs.filter(r => r.status === 'completed').length
    const successful = runs.filter(r => r.status === 'completed' && r.conclusion === 'success').length
    const failed = runs.filter(r => r.status === 'completed' && r.conclusion === 'failure').length
    const cancelled = runs.filter(r => r.status === 'completed' && r.conclusion === 'cancelled').length
    const inProgress = runs.filter(r => r.status !== 'completed').length

    const mostRecent = runs[0]
    const mostRecentTimestamp = new Date(mostRecent.updated_at).getTime()
    const recentWorkflows = runs.filter((run) => {
      const runTimestamp = new Date(run.updated_at).getTime()
      return mostRecentTimestamp - runTimestamp <= TIME_THRESHOLD_MS
    })

    const mostRecentPassed = recentWorkflows.every(
      (run) => run.status === 'completed' && run.conclusion === 'success',
    )
    const mostRecentFailed = recentWorkflows.some(
      (run) => run.status === 'completed' && run.conclusion === 'failure',
    )
    const mostRecentRunning = recentWorkflows.some((run) => run.status !== 'completed')

    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0
    let health: PipelineHealth = 'healthy'
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

  const summaryTone = useMemo<SummaryTone>(() => {
    if (!conclusion) return 'warning'
    if (conclusion.mostRecentPassed) return 'success'
    if (conclusion.mostRecentFailed) return 'error'
    return 'warning'
  }, [conclusion])

  return {
    getStatusColor,
    conclusion,
    summaryTone,
  }
}
