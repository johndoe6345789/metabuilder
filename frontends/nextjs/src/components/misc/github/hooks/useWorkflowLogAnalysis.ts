import { useCallback, useState } from 'react'
import { toast } from 'sonner'

import {
  formatWorkflowLogAnalysis,
  summarizeWorkflowLogs,
} from '@/lib/github/analyze-workflow-logs'

import { Job, RepoInfo, WorkflowRun } from '../types'

interface UseWorkflowLogAnalysisOptions {
  repoInfo: RepoInfo | null
  onAnalysisStart?: () => void
  onAnalysisComplete?: (report: string | null) => void
}

export function useWorkflowLogAnalysis({
  repoInfo,
  onAnalysisStart,
  onAnalysisComplete,
}: UseWorkflowLogAnalysisOptions) {
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null)
  const [runJobs, setRunJobs] = useState<Job[]>([])
  const [runLogs, setRunLogs] = useState<string | null>(null)
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)

  const downloadRunLogs = useCallback(
    async (runId: number, runName: string) => {
      setIsLoadingLogs(true)
      setSelectedRunId(runId)
      setRunLogs(null)
      setRunJobs([])

      try {
        const query = new URLSearchParams({
          runName,
          includeLogs: 'true',
          jobLimit: '20',
        })
        if (repoInfo) {
          query.set('owner', repoInfo.owner)
          query.set('repo', repoInfo.repo)
        }

        const response = await fetch(`/api/github/actions/runs/${runId}/logs?${query.toString()}`, {
          cache: 'no-store',
        })

        let payload: {
          jobs?: Job[]
          logsText?: string | null
          truncated?: boolean
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
            toast.error('GitHub API requires authentication for logs')
          }
          const message = payload?.error || `Failed to download logs (${response.status})`
          throw new Error(message)
        }

        const logsText = payload?.logsText ?? null
        setRunJobs(payload?.jobs ?? [])
        setRunLogs(logsText)

        if (logsText) {
          const blob = new Blob([logsText], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const anchor = document.createElement('a')
          anchor.href = url
          anchor.download = `workflow-logs-${runId}-${new Date().toISOString()}.txt`
          document.body.appendChild(anchor)
          anchor.click()
          document.body.removeChild(anchor)
          URL.revokeObjectURL(url)
        }

        if (payload?.truncated) {
          toast.info('Downloaded logs are truncated. Increase the job limit for more.')
        }

        toast.success('Workflow logs downloaded successfully')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to download logs'
        toast.error(errorMessage)
        setRunLogs(`Error fetching logs: ${errorMessage}`)
      } finally {
        setIsLoadingLogs(false)
      }
    },
    [repoInfo]
  )

  const analyzeRunLogs = useCallback(
    async (runs: WorkflowRun[] | null) => {
      if (!runLogs || !selectedRunId) {
        toast.error('No logs to analyze')
        return
      }

      onAnalysisStart?.()
      try {
        const selectedRun = runs?.find(r => r.id === selectedRunId)
        const summary = summarizeWorkflowLogs(runLogs)
        const report = formatWorkflowLogAnalysis(summary, {
          runName: selectedRun?.name,
          runId: selectedRunId,
        })
        onAnalysisComplete?.(report)
        toast.success('Log analysis complete')
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
        toast.error(errorMessage)
        onAnalysisComplete?.(null)
      }
    },
    [onAnalysisComplete, onAnalysisStart, runLogs, selectedRunId]
  )

  return {
    analyzeRunLogs,
    downloadRunLogs,
    isLoadingLogs,
    runJobs,
    runLogs,
    selectedRunId,
  }
}
