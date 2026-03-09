export interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  description?: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'accent' | 'muted' | string
  disabled?: boolean
  className?: string
}
