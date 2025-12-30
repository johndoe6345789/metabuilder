import { Chip, Stack, Typography } from '@mui/material'

import { CheckCircle, XCircle } from '@/fakemui/icons'

interface WorkflowRunStatusProps {
  status: string
  conclusion: string | null
}

export function WorkflowRunStatus({ status, conclusion }: WorkflowRunStatusProps) {
  const isSuccess = conclusion === 'success'
  const isFailure = conclusion === 'failure'
  const isInProgress = status === 'in_progress'

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {isSuccess && <CheckCircle size={20} style={{ color: 'var(--mui-palette-success-main)' }} />}
      {isFailure && <XCircle size={20} style={{ color: 'var(--mui-palette-error-main)' }} />}
      {isInProgress && <Chip label="Running..." size="small" variant="outlined" />}
      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
        {conclusion || status}
      </Typography>
    </Stack>
  )
}
