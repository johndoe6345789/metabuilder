import type { ComponentProps } from 'react'

export interface DotProps extends ComponentProps<'div'> {
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | string
  pulse?: boolean
}
