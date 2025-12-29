import { Download as DownloadIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { Stack, Typography } from '@mui/material'

import { Badge, Button } from '@/components/ui'

import type { RunListProps } from './run-list.types'
import { spinSx } from './run-list.types'

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
  <Stack
    direction={{ xs: 'column', md: 'row' }}
    spacing={2}
    alignItems={{ xs: 'flex-start', md: 'center' }}
  >
    <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Badge variant={autoRefreshEnabled ? 'default' : 'outline'} sx={{ fontSize: '0.75rem' }}>
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
)
