import type { ComponentProps } from 'react'

export interface FlexProps extends ComponentProps<'div'> {
  gap?: string | number
  align?: string
  justify?: string
  wrap?: string | boolean
  direction?: string
}
