import type { CSSProperties, ReactNode } from 'react'

/**
 * Cell alignment options (replaces MUI TableCellProps['align'])
 */
export type TableCellAlign = 'left' | 'center' | 'right' | 'justify' | 'inherit'

/**
 * Style properties for table cells (replaces MUI's sx prop)
 */
export type TableCellStyle = CSSProperties

export interface DataTableColumn<T> {
  key: string
  label: string
  align?: TableCellAlign
  width?: number | string
  render?: (row: T, rowIndex: number) => ReactNode
  sx?: TableCellStyle
}
