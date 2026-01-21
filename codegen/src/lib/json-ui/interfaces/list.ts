export interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
  itemClassName?: string
}
