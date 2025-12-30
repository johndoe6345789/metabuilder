/**
 * Alert severity levels for toast notifications
 * Replaces MUI's AlertColor type
 */
export type AlertSeverity = 'success' | 'info' | 'warning' | 'error'

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface ToastOptions {
  description?: string
  duration?: number
  position?: ToastPosition
  id?: string | number
}

export type ToastType = AlertSeverity | 'default'

export interface Toast {
  id: string | number
  message: string
  description?: string
  type: ToastType
  duration: number
}

export const DEFAULT_DURATION = 4000

export const anchorFromPosition = (position?: ToastPosition) => {
  const vertical = position?.startsWith('top') ? 'top' : 'bottom'
  const horizontal = position?.includes('left')
    ? 'left'
    : position?.includes('center')
      ? 'center'
      : 'right'
  return { vertical, horizontal } as const
}

export const containerPlacement = (position?: ToastPosition) => ({
  ...(position?.includes('top') ? { top: 16 } : { bottom: 16 }),
  ...(position?.includes('left')
    ? { left: 16 }
    : position?.includes('center')
      ? { left: '50%', transform: 'translateX(-50%)' }
      : { right: 16 }),
})
