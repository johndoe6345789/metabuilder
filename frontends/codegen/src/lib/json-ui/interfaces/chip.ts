import { ReactNode } from 'react'

export interface ChipProps {
  children?: ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'muted' | string
  size?: 'sm' | 'md' | string
  onRemove?: () => void
  className?: string
}
