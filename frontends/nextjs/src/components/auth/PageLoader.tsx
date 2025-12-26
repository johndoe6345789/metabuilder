import { CircularProgress, Stack, Typography } from '@mui/material'

interface PageLoaderProps {
  message?: string
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ minHeight: '50vh' }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Stack>
  )
}
