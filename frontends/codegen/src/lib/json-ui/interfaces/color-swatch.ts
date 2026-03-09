import type { ComponentProps } from 'react'

export interface ColorSwatchProps extends ComponentProps<'div'> {
  color?: string
  label?: string
  selected?: boolean
  onClick?: () => void
}
