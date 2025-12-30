import { Badge, Button } from '@/components/ui'
import { Stack, Typography } from '@/fakemui'
import { Download, Refresh } from '@/fakemui/icons'

import type { RunListProps } from './run-list.types'
import { spinStyle } from './run-list.types'

type RefreshControlsProps = Pick<
  RunListProps,
  | 'autoRefreshEnabled'
  | 'secondsUntilRefresh'
  | 'onToggleAutoRefresh'
  | 'onDownloadJson'
  | 'onRefresh'
  | 'runs'
  | 'isLoading'
>

export const RefreshControls = ({
  autoRefreshEnabled,
  secondsUntilRefresh,
  onToggleAutoRefresh,
  onDownloadJson,
  onRefresh,
  runs,
  isLoading,
}: RefreshControlsProps) => (
  <Stack direction="row" spacing={2} alignItems="center" className="flex-wrap md:flex-nowrap">
    <Stack spacing={1} alignItems="flex-end">
      <Stack direction="row" spacing={1} alignItems="center">
        <Badge variant={autoRefreshEnabled ? 'default' : 'outline'} style={{ fontSize: '0.75rem' }}>
          Auto-refresh {autoRefreshEnabled ? 'ON' : 'OFF'}
        </Badge>
        {autoRefreshEnabled && (
          <Typography variant="caption" color="text.secondary" style={{ fontFamily: 'monospace' }}>
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
      startIcon={<Download size={18} />}
    >
      Download JSON
    </Button>

    <Button
      onClick={onRefresh}
      disabled={isLoading}
      size="lg"
      startIcon={<Refresh style={isLoading ? spinStyle : undefined} />}
    >
      {isLoading ? 'Fetching...' : 'Refresh'}
    </Button>
  </Stack>
)
