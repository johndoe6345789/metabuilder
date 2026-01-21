import { ReactNode } from 'react'

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => ReactNode
  width?: string
}

export interface TableProps<T = Record<string, any>> {
  data: T[]
  columns: TableColumn<T>[]
  onRowClick?: (item: T) => void
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  className?: string
}
