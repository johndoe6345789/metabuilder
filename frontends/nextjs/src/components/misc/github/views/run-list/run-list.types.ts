import { SxProps, Theme } from '@mui/material/styles'

import type { WorkflowRun } from '../types'

type SummaryTone = 'success' | 'error' | 'warning'

export interface PipelineSummary {
  cancelled: number
  completed: number
  failed: number
  health: 'healthy' | 'warning' | 'critical'
  inProgress: number
  mostRecentFailed: boolean
  mostRecentPassed: boolean
  mostRecentRunning: boolean
  recentWorkflows: WorkflowRun[]
  successRate: number
  successful: number
  total: number
}

export interface RunListProps {
  runs: WorkflowRun[] | null
  isLoading: boolean
  error: string | null
  needsAuth: boolean
  repoLabel: string
  lastFetched: Date | null
  autoRefreshEnabled: boolean
  secondsUntilRefresh: number
  onToggleAutoRefresh: () => void
  onRefresh: () => void
  getStatusColor: (status: string, conclusion: string | null) => string
  onDownloadLogs: (runId: number, runName: string) => void
  onDownloadJson: () => void
  isLoadingLogs: boolean
  conclusion: PipelineSummary | null
  summaryTone: SummaryTone
  selectedRunId: number | null
}

export const spinSx: SxProps<Theme> = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}
