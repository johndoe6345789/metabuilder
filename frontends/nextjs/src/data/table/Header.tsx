import { TableCell, TableHead, TableRow, Typography } from '@mui/material'

import type { DataTableColumn } from './types'

interface HeaderProps<T> {
  columns: Array<DataTableColumn<T>>
  actionsHeader?: string
}

export function Header<T>({ columns, actionsHeader }: HeaderProps<T>) {
  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell
            key={column.key}
            align={column.align}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              ...(column.width ? { width: column.width } : {}),
              ...(column.sx ?? {}),
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}
            >
              {column.label}
            </Typography>
          </TableCell>
        ))}

        {actionsHeader ? (
          <TableCell
            align="right"
            sx={{ borderBottom: 1, borderColor: 'divider', width: 1, whiteSpace: 'nowrap' }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'uppercase', letterSpacing: 0.2 }}
            >
              {actionsHeader}
            </Typography>
          </TableCell>
        ) : null}
      </TableRow>
    </TableHead>
  )
}
