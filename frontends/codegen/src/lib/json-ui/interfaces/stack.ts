import type { ComponentProps } from 'react'

export interface StackProps extends ComponentProps<'div'> {
  direction?: 'horizontal' | 'vertical' | 'row' | 'column'
  spacing?: string | number
  align?: string
  wrap?: boolean
}
