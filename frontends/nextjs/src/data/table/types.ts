import type { TableCellProps } from '@mui/material'
import type { ReactNode } from 'react'

export interface DataTableColumn<T> {
  key: string
  label: string
  align?: TableCellProps['align']
  width?: number | string
  render?: (row: T, rowIndex: number) => ReactNode
  sx?: TableCellProps['sx']
}
