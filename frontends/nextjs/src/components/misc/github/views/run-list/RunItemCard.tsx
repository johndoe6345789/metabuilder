import { Box, Stack, Typography } from '@mui/material'
import { Download as DownloadIcon, OpenInNew as OpenInNewIcon, Autorenew as RunningIcon } from '@mui/icons-material'

import { Badge, Button, Card, CardContent } from '@/components/ui'

import type { WorkflowRun } from '../types'
import type { RunListProps } from './run-list.types'
import { spinSx } from './run-list.types'

type RunItemCardProps = Pick<
  RunListProps,
  'getStatusColor' | 'onDownloadLogs' | 'isLoadingLogs' | 'selectedRunId'
> & {
  run: WorkflowRun
}

export const RunItemCard = ({
  run,
  getStatusColor,
  onDownloadLogs,
  isLoadingLogs,
  selectedRunId,
}: RunItemCardProps) => {
  const statusIcon = getStatusColor(run.status, run.conclusion)

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
}
