import { ComponentProps } from 'react'

export interface ProgressProps extends ComponentProps<'div'> {
  value?: number
  className?: string
}
