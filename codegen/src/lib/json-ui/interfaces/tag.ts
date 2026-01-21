import { ReactNode } from 'react'

export interface TagProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
  className?: string
}
