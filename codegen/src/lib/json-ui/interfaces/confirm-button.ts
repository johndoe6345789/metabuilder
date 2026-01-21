import { ButtonHTMLAttributes, ReactNode } from 'react'

export interface ConfirmButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  onConfirm: () => void | Promise<void>
  confirmText?: string
  isLoading?: boolean
  children: ReactNode
}
