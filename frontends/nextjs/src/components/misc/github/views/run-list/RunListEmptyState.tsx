import { Box } from '@/fakemui'

import type { RunListProps } from './run-list.types'

type RunListEmptyStateProps = Pick<RunListProps, 'isLoading'>

export const RunListEmptyState = ({ isLoading }: RunListEmptyStateProps) => (
  <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
    {isLoading
      ? 'Loading workflow runs...'
      : 'No workflow runs found. Click refresh to fetch data.'}
  </Box>
)
