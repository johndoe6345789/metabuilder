import type React from 'react'

export interface SwitchProps {
  checked: boolean
  onChange: React.ChangeEventHandler<HTMLInputElement>
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}
