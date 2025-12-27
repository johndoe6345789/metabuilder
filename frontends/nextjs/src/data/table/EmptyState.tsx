import type { ReactNode } from 'react'
import { Stack, TableCell, TableRow, Typography } from '@mui/material'

interface EmptyStateProps {
  colSpan: number
  message?: string
  action?: ReactNode
}

export function EmptyState({ colSpan, message = 'No data to display', action }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={1}>
          <Typography variant="subtitle1">{message}</Typography>
          {action ? <Stack direction="row" spacing={1}>{action}</Stack> : null}
        </Stack>
      </TableCell>
    </TableRow>
  )
}
