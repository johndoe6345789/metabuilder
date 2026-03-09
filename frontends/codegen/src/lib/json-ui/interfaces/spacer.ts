import type { ComponentProps } from 'react'

export interface SpacerProps extends ComponentProps<'div'> {
  size?: string | number
  axis?: 'horizontal' | 'vertical' | string
}
