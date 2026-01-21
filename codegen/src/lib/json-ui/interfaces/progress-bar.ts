export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'accent' | 'destructive'
  showLabel?: boolean
  className?: string
}
