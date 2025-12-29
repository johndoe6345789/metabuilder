import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined'
import { Chip, Stack, Typography } from '@mui/material'

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
      {isSuccess && <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 20 }} />}
      {isFailure && <HighlightOffOutlinedIcon sx={{ color: 'error.main', fontSize: 20 }} />}
      {isInProgress && <Chip label="Running..." size="small" variant="outlined" />}
      <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
        {conclusion || status}
      </Typography>
    </Stack>
  )
}
