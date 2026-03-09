import { ReactNode } from 'react'

export interface TextHighlightProps {
  children: ReactNode
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'error'
  className?: string
}
