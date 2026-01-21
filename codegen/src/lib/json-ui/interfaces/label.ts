import { ReactNode } from 'react'

export interface LabelProps {
  children: ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}
