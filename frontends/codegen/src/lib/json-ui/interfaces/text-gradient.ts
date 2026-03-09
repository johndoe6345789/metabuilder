import { ReactNode } from 'react'

export interface TextGradientProps {
  children: ReactNode
  from?: string
  to?: string
  via?: string
  direction?: 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl' | 'to-tr' | 'to-tl'
  className?: string
  animate?: boolean
}
