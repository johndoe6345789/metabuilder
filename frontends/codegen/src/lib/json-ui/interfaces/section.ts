import type { ComponentProps } from 'react'

export interface SectionProps extends ComponentProps<'div'> {
  spacing?: string | number
  size?: 'sm' | 'md' | 'lg' | 'xl' | string
}
