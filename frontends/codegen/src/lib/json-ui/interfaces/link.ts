import type { ComponentProps } from 'react'

export interface LinkProps extends ComponentProps<'a'> {
  href?: string
  variant?: string
}
