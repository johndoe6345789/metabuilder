export interface PanelProps {
  title?: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'bordered' | 'elevated'
}
