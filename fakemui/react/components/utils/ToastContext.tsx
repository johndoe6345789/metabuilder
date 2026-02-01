'use client'

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { Snackbar, SnackbarContent } from '../feedback/Snackbar'

export type ToastSeverity = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  /** Toast message content */
  message: string
  /** Severity level for styling */
  severity?: ToastSeverity
  /** Auto hide duration in ms (null to disable) */
  autoHideDuration?: number | null
  /** Action button content */
  action?: React.ReactNode
  /** Custom key for deduplication */
  key?: string
  /** Callback when toast closes */
  onClose?: () => void
  /** Anchor position */
  anchorOrigin?: {
    vertical: 'top' | 'bottom'
    horizontal: 'left' | 'center' | 'right'
  }
}

interface Toast extends Required<Pick<ToastOptions, 'message' | 'severity' | 'autoHideDuration'>> {
  id: string
  action?: React.ReactNode
  onClose?: () => void
  anchorOrigin: NonNullable<ToastOptions['anchorOrigin']>
}

interface ToastContextValue {
  /** Show a toast notification */
  toast: (options: ToastOptions | string) => string
  /** Show a success toast */
  success: (message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => string
  /** Show an error toast */
  error: (message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => string
  /** Show a warning toast */
  warning: (message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => string
  /** Show an info toast */
  info: (message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => string
  /** Close a specific toast by ID */
  close: (id: string) => void
  /** Close all toasts */
  closeAll: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastIdCounter = 0
const generateId = () => `toast-${++toastIdCounter}`

export interface ToastProviderProps {
  children: React.ReactNode
  /** Default auto hide duration in ms */
  defaultAutoHideDuration?: number
  /** Maximum number of toasts to show at once */
  maxToasts?: number
  /** Default anchor position */
  defaultAnchorOrigin?: ToastOptions['anchorOrigin']
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultAutoHideDuration = 5000,
  maxToasts = 3,
  defaultAnchorOrigin = { vertical: 'bottom', horizontal: 'left' },
}) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Clear timer when toast is removed
  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  // Close a specific toast
  const close = useCallback((id: string) => {
    clearTimer(id)
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      if (toast?.onClose) {
        toast.onClose()
      }
      return prev.filter(t => t.id !== id)
    })
  }, [clearTimer])

  // Close all toasts
  const closeAll = useCallback(() => {
    timersRef.current.forEach((_, id) => clearTimer(id))
    setToasts([])
  }, [clearTimer])

  // Main toast function
  const toast = useCallback((options: ToastOptions | string): string => {
    const opts: ToastOptions = typeof options === 'string' ? { message: options } : options
    const id = opts.key || generateId()

    // Check if toast with same key already exists
    setToasts(prev => {
      const existingIndex = prev.findIndex(t => t.id === id)
      const newToast: Toast = {
        id,
        message: opts.message,
        severity: opts.severity || 'info',
        autoHideDuration: opts.autoHideDuration ?? defaultAutoHideDuration,
        action: opts.action,
        onClose: opts.onClose,
        anchorOrigin: opts.anchorOrigin || defaultAnchorOrigin,
      }

      let newToasts: Toast[]
      if (existingIndex >= 0) {
        // Update existing toast
        newToasts = [...prev]
        newToasts[existingIndex] = newToast
      } else {
        // Add new toast (respecting maxToasts)
        newToasts = [...prev, newToast]
        if (newToasts.length > maxToasts) {
          const removed = newToasts.shift()
          if (removed) clearTimer(removed.id)
        }
      }
      return newToasts
    })

    // Set up auto-hide timer
    const duration = opts.autoHideDuration ?? defaultAutoHideDuration
    if (duration !== null && duration > 0) {
      clearTimer(id) // Clear existing timer if updating
      const timer = setTimeout(() => close(id), duration)
      timersRef.current.set(id, timer)
    }

    return id
  }, [defaultAutoHideDuration, defaultAnchorOrigin, maxToasts, clearTimer, close])

  // Helper methods for each severity
  const success = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => {
    return toast({ ...options, message, severity: 'success' })
  }, [toast])

  const error = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => {
    return toast({ ...options, message, severity: 'error' })
  }, [toast])

  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => {
    return toast({ ...options, message, severity: 'warning' })
  }, [toast])

  const info = useCallback((message: string, options?: Omit<ToastOptions, 'message' | 'severity'>) => {
    return toast({ ...options, message, severity: 'info' })
  }, [toast])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer))
    }
  }, [])

  const contextValue: ToastContextValue = {
    toast,
    success,
    error,
    warning,
    info,
    close,
    closeAll,
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Render toasts */}
      {toasts.map(t => (
        <Snackbar
          key={t.id}
          open={true}
          autoHideDuration={null} // Handled by context
          onClose={() => close(t.id)}
          anchorOrigin={t.anchorOrigin}
        >
          <SnackbarContent
            message={t.message}
            severity={t.severity}
            action={t.action}
          />
        </Snackbar>
      ))}
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast notifications
 * 
 * @example
 * ```tsx
 * const { toast, success, error } = useToast()
 * 
 * // Simple usage
 * toast('Hello world')
 * 
 * // With severity helpers
 * success('Operation completed!')
 * error('Something went wrong')
 * 
 * // With options
 * toast({
 *   message: 'Custom toast',
 *   severity: 'warning',
 *   autoHideDuration: 3000,
 *   action: <button onClick={() => {}}>Undo</button>
 * })
 * ```
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
