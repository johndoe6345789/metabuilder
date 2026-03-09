import type { ComponentProps } from 'react'

export interface CountBadgeProps extends ComponentProps<'div'> {
  count?: number
  max?: number
  variant?: string
}
