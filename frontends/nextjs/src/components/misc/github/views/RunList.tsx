import { Stack } from '@/fakemui'

import { Card, CardContent, CardHeader } from '@/components/ui'

import { Filters } from './run-list/Filters'
import { RefreshControls } from './run-list/RefreshControls'
import type { RunListProps } from './run-list/run-list.types'
import { RunListAlerts } from './run-list/RunListAlerts'
import { RunTable } from './run-list/Table'

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
    <Card style={{ borderWidth: 2, borderColor: 'var(--color-divider)' }}>
      <CardHeader>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          className="flex-wrap lg:flex-nowrap"
        >
          <Filters repoLabel={repoLabel} lastFetched={lastFetched} />

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

        <RunTable
          runs={runs}
          isLoading={isLoading}
          getStatusColor={getStatusColor}
          onDownloadLogs={onDownloadLogs}
          isLoadingLogs={isLoadingLogs}
          selectedRunId={selectedRunId}
        />
      </CardContent>
    </Card>
  )
}
