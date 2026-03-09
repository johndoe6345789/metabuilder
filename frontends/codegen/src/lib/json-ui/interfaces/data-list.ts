import type { ComponentProps, ReactNode } from 'react'

export interface DataListProps extends ComponentProps<'div'> {
  items?: any[]
  emptyMessage?: string | ReactNode
  renderItem?: (item: any, index: number) => ReactNode
}
