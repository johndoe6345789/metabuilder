import { Box, Stack, Typography } from '@/fakemui'

import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Autorenew, Download, OpenInNew } from '@/fakemui/icons'

import type { WorkflowRun } from '../types'
import type { RunListProps } from './run-list.types'
import { spinSx } from './run-list.types'

type RunRowProps = Pick<
  RunListProps,
  'getStatusColor' | 'onDownloadLogs' | 'isLoadingLogs' | 'selectedRunId'
> & {
  run: WorkflowRun
}

export const RunRow = ({
  run,
  getStatusColor,
  onDownloadLogs,
  isLoadingLogs,
  selectedRunId,
}: RunRowProps) => {
  const statusIcon = getStatusColor(run.status, run.conclusion)
  const isSelectedRun = isLoadingLogs && selectedRunId === run.id

  return (
    <Card variant="outlined" sx={{ borderColor: 'divider' }}>
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
              disabled={isSelectedRun}
              startIcon={
                isSelectedRun ? (
                  <Autorenew size={16} style={spinSx} />
                ) : (
                  <Download size={16} />
                )
              }
            >
              {isSelectedRun ? 'Loading...' : 'Download Logs'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              component="a"
              href={run.html_url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNew size={16} />}
            >
              View
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
