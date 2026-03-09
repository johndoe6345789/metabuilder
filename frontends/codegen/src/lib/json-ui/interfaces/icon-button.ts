import type { ComponentProps, ReactNode } from 'react'

export interface IconButtonProps extends ComponentProps<'div'> {
  icon?: ReactNode
  variant?: string
  size?: string
  onClick?: () => void
  title?: string
}
