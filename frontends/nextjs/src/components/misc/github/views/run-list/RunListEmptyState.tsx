import { Box } from '@/fakemui'

import type { RunListProps } from './run-list.types'

type RunListEmptyStateProps = Pick<RunListProps, 'isLoading'>

export const RunListEmptyState = ({ isLoading }: RunListEmptyStateProps) => (
  <Box style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)' }}>
    {isLoading
      ? 'Loading workflow runs...'
      : 'No workflow runs found. Click refresh to fetch data.'}
  </Box>
)
