import { Box, Stack, Typography } from '@mui/material'

import { CheckCircle as SuccessIcon } from '@mui/icons-material'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@/components/ui'

import type { WorkflowRun } from '../types'
import { RefreshControls } from './run-list/RefreshControls'
import { RunItemCard } from './run-list/RunItemCard'
import { RunListAlerts } from './run-list/RunListAlerts'
import { RunListEmptyState } from './run-list/RunListEmptyState'
import type { RunListProps } from './run-list/run-list.types'

export function RunList({
  runs,
  isLoading,
  error,
  needsAuth,
  repoLabel,
  lastFetched,
  autoRefreshEnabled,
  secondsUntilRefresh,
  onToggleAutoRefresh,
  onRefresh,
  getStatusColor,
  onDownloadLogs,
  onDownloadJson,
  isLoadingLogs,
  conclusion,
  summaryTone,
  selectedRunId,
}: RunListProps) {
  return (
    <Card sx={{ borderWidth: 2, borderColor: 'divider' }}>
      <CardHeader>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          alignItems={{ xs: 'flex-start', lg: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              GitHub Actions Monitor
            </Typography>
            <Typography color="text.secondary">
              Repository:{' '}
              <Box
                component="code"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  fontSize: '0.875rem',
                }}
              >
                {repoLabel}
              </Box>
            </Typography>
            {lastFetched && (
              <Typography variant="caption" color="text.secondary">
                Last fetched: {lastFetched.toLocaleString()}
              </Typography>
            )}
          </Stack>

          <RefreshControls
            autoRefreshEnabled={autoRefreshEnabled}
            secondsUntilRefresh={secondsUntilRefresh}
            onToggleAutoRefresh={onToggleAutoRefresh}
            onDownloadJson={onDownloadJson}
            onRefresh={onRefresh}
            runs={runs}
            isLoading={isLoading}
          />
        </Stack>
      </CardHeader>

      <CardContent>
        <RunListAlerts
          error={error}
          needsAuth={needsAuth}
          conclusion={conclusion}
          summaryTone={summaryTone}
        />

        <Card sx={{ borderWidth: 2, borderColor: 'divider' }}>
          <CardHeader>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center">
                <SuccessIcon sx={{ color: 'success.main', fontSize: 24 }} />
                <CardTitle>Recent Workflow Runs</CardTitle>
              </Stack>
              {isLoading && <Skeleton sx={{ width: 120, height: 12 }} />}
            </Stack>
            <CardDescription>Latest GitHub Actions runs with status and controls</CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading && !runs && (
              <Stack spacing={2}>
                <Skeleton sx={{ height: 96 }} />
                <Skeleton sx={{ height: 96 }} />
                <Skeleton sx={{ height: 96 }} />
              </Stack>
            )}

            {runs && runs.length > 0 ? (
              <Stack spacing={2}>
                {runs.map((run: WorkflowRun) => (
                  <RunItemCard
                    key={run.id}
                    run={run}
                    getStatusColor={getStatusColor}
                    onDownloadLogs={onDownloadLogs}
                    isLoadingLogs={isLoadingLogs}
                    selectedRunId={selectedRunId}
                  />
                ))}
                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!runs) return
                      const jsonData = JSON.stringify(runs, null, 2)
                      navigator.clipboard.writeText(jsonData)
                    }}
                  >
                    Copy All as JSON
                  </Button>
                </Box>
              </Stack>
            ) : (
              <RunListEmptyState isLoading={isLoading} />
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
