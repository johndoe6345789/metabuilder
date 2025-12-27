import { Box, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  Autorenew as RunningIcon,
  Cancel as FailureIcon,
  CheckCircle as SuccessIcon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material'

import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton } from '@/components/ui'

import { WorkflowRun } from '../types'

const spinSx = {
  animation: 'spin 1s linear infinite',
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
}

interface PipelineSummary {
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

interface RunListProps {
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
  summaryTone: 'success' | 'error' | 'warning'
  selectedRunId: number | null
}

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

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge
                  variant={autoRefreshEnabled ? 'default' : 'outline'}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
                </Badge>
                {autoRefreshEnabled && (
                  <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                    Next refresh: {secondsUntilRefresh}s
                  </Typography>
                )}
              </Stack>
              <Button onClick={onToggleAutoRefresh} variant="outline" size="sm">
                {autoRefreshEnabled ? 'Disable' : 'Enable'} Auto-refresh
              </Button>
            </Stack>

            <Button
              onClick={onDownloadJson}
              disabled={!runs || runs.length === 0}
              variant="outline"
              size="sm"
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
            >
              Download JSON
            </Button>

            <Button
              onClick={onRefresh}
              disabled={isLoading}
              size="lg"
              startIcon={<RefreshIcon sx={isLoading ? spinSx : undefined} />}
            >
              {isLoading ? 'Fetching...' : 'Refresh'}
            </Button>
          </Stack>
        </Stack>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {needsAuth && (
          <Alert variant="warning" sx={{ mb: 2 }}>
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              GitHub API requires authentication for this request. Please configure credentials and retry.
            </AlertDescription>
          </Alert>
        )}

        {conclusion && (
          <Alert
            sx={(theme) => ({
              borderWidth: 2,
              borderColor: theme.palette[summaryTone].main,
              bgcolor: alpha(theme.palette[summaryTone].main, 0.08),
              alignItems: 'flex-start',
              mb: 2,
            })}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              {summaryTone === 'success' && (
                <SuccessIcon sx={{ color: 'success.main', fontSize: 48 }} />
              )}
              {summaryTone === 'error' && (
                <FailureIcon sx={{ color: 'error.main', fontSize: 48 }} />
              )}
              {summaryTone === 'warning' && (
                <RunningIcon sx={{ color: 'warning.main', fontSize: 48, ...spinSx }} />
              )}
              <Box flex={1}>
                <AlertTitle>
                  <Box sx={{ fontSize: '1.25rem', fontWeight: 700, mb: 1 }}>
                    {conclusion.mostRecentPassed && 'Most Recent Builds: ALL PASSED'}
                    {conclusion.mostRecentFailed && 'Most Recent Builds: FAILURES DETECTED'}
                    {conclusion.mostRecentRunning && 'Most Recent Builds: RUNNING'}
                  </Box>
                </AlertTitle>
                <AlertDescription>
                  <Stack spacing={2}>
                    <Typography variant="body2">
                      {conclusion.recentWorkflows.length > 1
                        ? `Showing ${conclusion.recentWorkflows.length} workflows from the most recent run:`
                        : 'Most recent workflow:'}
                    </Typography>
                    <Stack spacing={1.5}>
                      {conclusion.recentWorkflows.map((workflow: WorkflowRun) => {
                        const statusLabel = workflow.status === 'completed'
                          ? workflow.conclusion
                          : workflow.status
                        const badgeVariant = workflow.conclusion === 'success'
                          ? 'default'
                          : workflow.conclusion === 'failure'
                          ? 'destructive'
                          : 'outline'

                        return (
                          <Box
                            key={workflow.id}
                            sx={{
                              bgcolor: 'background.paper',
                              borderRadius: 2,
                              p: 2,
                              boxShadow: 1,
                            }}
                          >
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                {workflow.status === 'completed' && workflow.conclusion === 'success' && (
                                  <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                )}
                                {workflow.status === 'completed' && workflow.conclusion === 'failure' && (
                                  <FailureIcon sx={{ color: 'error.main', fontSize: 20 }} />
                                )}
                                {workflow.status !== 'completed' && (
                                  <RunningIcon sx={{ color: 'warning.main', fontSize: 20, ...spinSx }} />
                                )}
                                <Typography fontWeight={600}>{workflow.name}</Typography>
                                <Badge variant={badgeVariant} sx={{ fontSize: '0.75rem' }}>
                                  {statusLabel}
                                </Badge>
                              </Stack>
                              <Stack
                                direction="row"
                                spacing={2}
                                flexWrap="wrap"
                                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                              >
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Branch:</Typography>
                                  <Box
                                    component="code"
                                    sx={{
                                      px: 0.75,
                                      py: 0.25,
                                      bgcolor: 'action.hover',
                                      borderRadius: 1,
                                      fontFamily: 'monospace',
                                    }}
                                  >
                                    {workflow.head_branch}
                                  </Box>
                                </Stack>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Typography fontWeight={600}>Updated:</Typography>
                                  <Typography>{new Date(workflow.updated_at).toLocaleString()}</Typography>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Box>
                        )
                      })}
                    </Stack>
                    <Box>
                      <Button
                        variant={conclusion.mostRecentPassed ? 'default' : 'destructive'}
                        size="sm"
                        component="a"
                        href="https://github.com/johndoe6345789/metabuilder/actions"
                        target="_blank"
                        rel="noopener noreferrer"
                        endIcon={<OpenInNewIcon sx={{ fontSize: 18 }} />}
                      >
                        View All Workflows on GitHub
                      </Button>
                    </Box>
                  </Stack>
                </AlertDescription>
              </Box>
            </Stack>
          </Alert>
        )}

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
                {runs.map((run) => {
                  const statusIcon = getStatusColor(run.status, run.conclusion)
                  return (
                    <Card key={run.id} variant="outlined" sx={{ borderColor: 'divider' }}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between">
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box
                                sx={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: '50%',
                                  bgcolor: statusIcon,
                                }}
                              />
                              <Typography fontWeight={600}>{run.name}</Typography>
                              <Badge variant="outline" sx={{ textTransform: 'capitalize' }}>
                                {run.event}
                              </Badge>
                            </Stack>

                            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ color: 'text.secondary' }}>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography fontWeight={600}>Branch:</Typography>
                                <Box
                                  component="code"
                                  sx={{
                                    px: 0.75,
                                    py: 0.25,
                                    bgcolor: 'action.hover',
                                    borderRadius: 1,
                                    fontFamily: 'monospace',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {run.head_branch}
                                </Box>
                              </Stack>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography fontWeight={600}>Event:</Typography>
                                <Typography>{run.event}</Typography>
                              </Stack>
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Typography fontWeight={600}>Status:</Typography>
                                <Typography sx={{ color: getStatusColor(run.status, run.conclusion) }}>
                                  {run.status === 'completed' ? run.conclusion : run.status}
                                </Typography>
                              </Stack>
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                              Updated: {new Date(run.updated_at).toLocaleString()}
                            </Typography>
                          </Stack>

                          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadLogs(run.id, run.name)}
                              disabled={isLoadingLogs && selectedRunId === run.id}
                              startIcon={
                                isLoadingLogs && selectedRunId === run.id
                                  ? <RunningIcon sx={{ fontSize: 16, ...spinSx }} />
                                  : <DownloadIcon sx={{ fontSize: 16 }} />
                              }
                            >
                              {isLoadingLogs && selectedRunId === run.id ? 'Loading...' : 'Download Logs'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              component="a"
                              href={run.html_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              endIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                            >
                              View
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  )
                })}
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
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                {isLoading ? 'Loading workflow runs...' : 'No workflow runs found. Click refresh to fetch data.'}
              </Box>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
