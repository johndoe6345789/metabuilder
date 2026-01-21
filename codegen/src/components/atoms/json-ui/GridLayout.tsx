import { cn } from '@/lib/utils'

interface GridLayoutProps {
  children: React.ReactNode
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const gapClasses = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

export function GridLayout({ children, cols = { base: 1 }, gap = 'md', className }: GridLayoutProps) {
  const gridCols: string[] = []
  
  if (cols.base) gridCols.push(`grid-cols-${cols.base}`)
  if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`)
  if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`)
  if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`)
  if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`)

  return (
    <div className={cn('grid', gapClasses[gap], ...gridCols, className)}>
      {children}
    </div>
  )
}
