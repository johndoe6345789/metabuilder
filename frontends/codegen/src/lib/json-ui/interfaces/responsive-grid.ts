import type { ComponentProps } from 'react'

export interface ResponsiveGridProps extends ComponentProps<'div'> {
  columns?: number | string
  gap?: string | number
}
