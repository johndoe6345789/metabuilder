export interface NotificationProps {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  onClose?: () => void
  className?: string
}
