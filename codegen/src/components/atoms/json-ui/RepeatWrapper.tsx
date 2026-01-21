import { cn } from '@/lib/utils'

interface RepeatWrapperProps {
  items: any[]
  render: (item: any, index: number) => React.ReactNode
  emptyMessage?: string
  className?: string
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export function RepeatWrapper({ 
  items, 
  render, 
  emptyMessage, 
  className,
  gap = 'md' 
}: RepeatWrapperProps) {
  if (!items || items.length === 0) {
    return emptyMessage ? (
      <div className={cn('text-center text-muted-foreground text-sm p-4', className)}>
        {emptyMessage}
      </div>
    ) : null
  }

  return (
    <div className={cn('flex flex-col', gapClasses[gap], className)}>
      {items.map((item, index) => (
        <div key={index}>
          {render(item, index)}
        </div>
      ))}
    </div>
  )
}
