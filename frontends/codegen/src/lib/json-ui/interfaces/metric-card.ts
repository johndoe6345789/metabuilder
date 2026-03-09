import type { ComponentProps, ReactNode } from 'react'

export interface MetricCardProps extends ComponentProps<'div'> {
  label?: string
  value?: string | number
  icon?: ReactNode
  trend?: { value: number; direction: string }
}
