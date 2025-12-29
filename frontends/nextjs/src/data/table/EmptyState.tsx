import { Stack, TableCell, TableRow, Typography } from '@mui/material'
import type { ReactNode } from 'react'

/**
 * Props for the {@link EmptyState} table row.
 *
 * This is typically used when a data-driven table has no rows to display and
 * you want to show a friendly message, optionally with a follow-up action.
 *
 * @property colSpan - Number of table columns the empty-state cell should span.
 * @property message - Optional message shown to explain that there is no data.
 * @property action - Optional call-to-action content (for example, a "Create"
 * button or "Reload" button) rendered below the message.
 */
interface EmptyStateProps {
  colSpan: number
  message?: string
  action?: ReactNode
}

/**
 * Renders a full-width table row indicating that there is currently no data
 * to display for the surrounding table.
 *
 * Use this component as the only row in a table body when the data source is
 * empty. You can pass an optional `action` to surface primary actions such as
 * creating a new item or retrying a failed load.
 */
export function EmptyState({ colSpan, message = 'No data to display', action }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ py: 6 }}>
        <Stack alignItems="center" spacing={1}>
          <Typography variant="subtitle1">{message}</Typography>
          {action ? (
            <Stack direction="row" spacing={1}>
              {action}
            </Stack>
          ) : null}
        </Stack>
      </TableCell>
    </TableRow>
  )
}
