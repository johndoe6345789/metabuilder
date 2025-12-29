import type { ReactNode } from 'react'
import { TableBody, TableCell, TableRow } from '@mui/material'

import { EmptyState } from './EmptyState'
import type { DataTableColumn } from './types'

interface BodyProps<T> {
  columns: Array<DataTableColumn<T>>
  rows: T[]
  getRowId?: (row: T, rowIndex: number) => string | number
  renderActions?: (row: T) => ReactNode
  onRowClick?: (row: T) => void
  emptyMessage?: string
}

export function Body<T>({
  columns,
  rows,
  getRowId,
  renderActions,
  onRowClick,
  emptyMessage = 'No records found',
}: BodyProps<T>) {
  const colSpan = columns.length + (renderActions ? 1 : 0)

  return (
    <TableBody>
      {rows.length === 0 ? (
        <EmptyState colSpan={colSpan} message={emptyMessage} />
      ) : (
        rows.map((row, rowIndex) => {
          const rowId = getRowId ? getRowId(row, rowIndex) : rowIndex
          const handleClick = onRowClick ? () => onRowClick(row) : undefined

          return (
            <TableRow
              key={rowId}
              hover={Boolean(onRowClick)}
              onClick={handleClick}
              sx={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map(column => {
                const content = column.render
                  ? column.render(row, rowIndex)
                  : (row as Record<string, unknown>)[column.key]

                return (
                  <TableCell key={column.key} align={column.align} sx={column.sx}>
                    {content ?? '—'}
                  </TableCell>
                )
              })}

              {renderActions ? <TableCell align="right">{renderActions(row)}</TableCell> : null}
            </TableRow>
          )
        })
      )}
    </TableBody>
  )
}
