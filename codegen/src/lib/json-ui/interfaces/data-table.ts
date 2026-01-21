import { ReactNode } from 'react'

export interface Column<T> {
  key: string
  header: string | ReactNode
  cell?: (item: T) => ReactNode
  sortable?: boolean
  width?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  emptyMessage?: string
  className?: string
}
