import { useState, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export function useNotification() {
  const [notifications, setNotifications] = useState<Array<{ id: string; message: string; type: NotificationType }>>([])

  const notify = useCallback((message: string, type: NotificationType = 'info', duration = 3000) => {
    const id = Math.random().toString(36)
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), duration)
  }, [])

  const success = useCallback((msg: string) => notify(msg, 'success'), [notify])
  const error = useCallback((msg: string) => notify(msg, 'error'), [notify])
  const warning = useCallback((msg: string) => notify(msg, 'warning'), [notify])
  const info = useCallback((msg: string) => notify(msg, 'info'), [notify])

  return { notifications, notify, success, error, warning, info }
}
