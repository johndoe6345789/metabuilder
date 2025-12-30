import { TableCell, TableHead, TableRow, Typography } from '@/fakemui'

import type { DataTableColumn } from './types'

interface HeaderProps<T> {
  columns: Array<DataTableColumn<T>>
  actionsHeader?: string
}

export function Header<T>({ columns, actionsHeader }: HeaderProps<T>) {
  return (
    <TableHead>
      <TableRow>
        {columns.map(column => (
          <TableCell
            key={column.key}
            align={column.align}
            className={`table-header-cell ${column.width ? `width-${column.width}` : ''}`}
          >
            <Typography variant="caption" className="table-header-text">
              {column.label}
            </Typography>
          </TableCell>
        ))}

        {actionsHeader ? (
          <TableCell
            align="right"
            className="table-header-cell table-header-cell--actions"
          >
            <Typography variant="caption" className="table-header-text">
              {actionsHeader}
            </Typography>
          </TableCell>
        ) : null}
      </TableRow>
    </TableHead>
  )
}
