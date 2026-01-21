import { ReactNode } from 'react'

export interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: ReactNode
  className?: string
}
