import { Box, Stack, Typography } from '@/fakemui'

import type { RunListProps } from './run-list.types'

type FiltersProps = Pick<RunListProps, 'repoLabel' | 'lastFetched'>

export const Filters = ({ repoLabel, lastFetched }: FiltersProps) => (
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
)
