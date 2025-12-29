import { Box, Stack } from '@mui/material'
import { CheckCircle as SuccessIcon } from '@mui/icons-material'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'

import type { RunListProps } from './run-list.types'
import { RunListEmptyState } from './RunListEmptyState'
import { RunRow } from './RunRow'

type RunTableProps = Pick<
  RunListProps,
  'runs' | 'isLoading' | 'getStatusColor' | 'onDownloadLogs' | 'isLoadingLogs' | 'selectedRunId'
>

export const RunTable = ({
  runs,
  isLoading,
  getStatusColor,
  onDownloadLogs,
  isLoadingLogs,
  selectedRunId,
}: RunTableProps) => {
  const copyRunsToClipboard = () => {
    if (!runs) return

    const jsonData = JSON.stringify(runs, null, 2)
    navigator.clipboard.writeText(jsonData)
  }

  return (
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
            {runs.map(run => (
              <RunRow
                key={run.id}
                run={run}
                getStatusColor={getStatusColor}
                onDownloadLogs={onDownloadLogs}
                isLoadingLogs={isLoadingLogs}
                selectedRunId={selectedRunId}
              />
            ))}
            <Box sx={{ textAlign: 'center', pt: 2 }}>
              <Button variant="outline" onClick={copyRunsToClipboard}>
                Copy All as JSON
              </Button>
            </Box>
          </Stack>
        ) : (
          <RunListEmptyState isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  )
}
