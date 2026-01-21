import { ReactNode } from 'react'

export interface ChipProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'muted'
  size?: 'sm' | 'md'
  onRemove?: () => void
  className?: string
}
