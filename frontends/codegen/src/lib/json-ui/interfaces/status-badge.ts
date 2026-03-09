import type { ComponentProps } from 'react'

export interface StatusBadgeProps extends ComponentProps<'div'> {
  status?: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning' | string
}
