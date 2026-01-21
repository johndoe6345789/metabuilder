export interface RepeatWrapperProps {
  items: any[]
  render: (item: any, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}
