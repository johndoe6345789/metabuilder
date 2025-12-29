import { Button, Stack, Typography } from '@mui/material'
import LockRoundedIcon from '@mui/icons-material/LockRounded'

interface AccessDeniedProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function AccessDenied({
  title = 'Access restricted',
  description = 'You do not have permission to view this area.',
  actionLabel,
  onAction,
}: AccessDeniedProps) {
  return (
    <Stack
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '50vh', textAlign: 'center' }}
    >
      <LockRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
      <Stack spacing={1}>
        <Typography variant="h5">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Stack>
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}
