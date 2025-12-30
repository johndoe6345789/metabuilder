import { Box, Stack, Typography } from '@/fakemui'

import { Badge, Button, Card, CardContent } from '@/components/ui'
import { Autorenew, Download, OpenInNew } from '@/fakemui/icons'

import type { WorkflowRun } from '../types'
import type { RunListProps } from './run-list.types'
import { spinStyle } from './run-list.types'

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
    <Card variant="outlined" style={{ borderColor: 'var(--color-divider)' }}>
      <CardContent>
        <Stack direction="row" spacing={2} justifyContent="space-between" className="flex-wrap md:flex-nowrap">
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: statusIcon,
                }}
              />
              <Typography style={{ fontWeight: 600 }}>{run.name}</Typography>
              <Badge variant="outline" style={{ textTransform: 'capitalize' }}>
                {run.event}
              </Badge>
            </Stack>

            <Stack direction="row" spacing={2} className="flex-wrap" style={{ color: 'var(--color-text-secondary)' }}>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography style={{ fontWeight: 600 }}>Branch:</Typography>
                <Box
                  component="code"
                  style={{
                    padding: '2px 6px',
                    backgroundColor: 'var(--color-action-hover)',
                    borderRadius: 4,
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  {run.head_branch}
                </Box>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography style={{ fontWeight: 600 }}>Event:</Typography>
                <Typography>{run.event}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography style={{ fontWeight: 600 }}>Status:</Typography>
                <Typography style={{ color: getStatusColor(run.status, run.conclusion) }}>
                  {run.status === 'completed' ? run.conclusion : run.status}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="caption" color="text.secondary" style={{ marginTop: 4, display: 'block' }}>
              Updated: {new Date(run.updated_at).toLocaleString()}
            </Typography>
          </Stack>

          <Stack spacing={1} alignItems="flex-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadLogs(run.id, run.name)}
              disabled={isSelectedRun}
              startIcon={
                isSelectedRun ? (
                  <Autorenew size={16} style={spinStyle} />
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
