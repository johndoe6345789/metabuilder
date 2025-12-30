import { Box, Stack, Typography } from '@/fakemui'

import { Alert, AlertDescription, AlertTitle, Badge, Button } from '@/components/ui'
import { Autorenew, Cancel, CheckCircle, OpenInNew } from '@/fakemui/icons'

import type { WorkflowRun } from '../types'
import type { PipelineSummary, RunListProps } from './run-list.types'
import { spinSx } from './run-list.types'

type RunListAlertsProps = Pick<RunListProps, 'error' | 'needsAuth' | 'conclusion' | 'summaryTone'>

type SummaryAlertProps = {
  conclusion: PipelineSummary
  summaryTone: RunListProps['summaryTone']
}

const SummaryAlert = ({ conclusion, summaryTone }: SummaryAlertProps) => (
  <Alert
    sx={theme => ({
      borderWidth: 2,
      borderColor: theme.palette[summaryTone].main,
      bgcolor: alpha(theme.palette[summaryTone].main, 0.08),
      alignItems: 'flex-start',
      mb: 2,
    })}
  >
    <Stack direction="row" spacing={2} alignItems="flex-start">
      {summaryTone === 'success' && <CheckCircle size={48} style={{ color: 'var(--mui-palette-success-main)' }} />}
      {summaryTone === 'error' && <Cancel size={48} style={{ color: 'var(--mui-palette-error-main)' }} />}
      {summaryTone === 'warning' && (
        <Autorenew size={48} style={{ color: 'var(--mui-palette-warning-main)', ...spinSx }} />
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
                const statusLabel =
                  workflow.status === 'completed' ? workflow.conclusion : workflow.status
                const badgeVariant =
                  workflow.conclusion === 'success'
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
                        <Badge variant={badgeVariant} sx={{ fontSize: '0.75rem', p: 0.5 }}>
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
)

export const RunListAlerts = ({
  error,
  needsAuth,
  conclusion,
  summaryTone,
}: RunListAlertsProps) => (
  <>
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
          GitHub API requires authentication for this request. Please configure credentials and
          retry.
        </AlertDescription>
      </Alert>
    )}

    {conclusion && <SummaryAlert conclusion={conclusion} summaryTone={summaryTone} />}
  </>
)
