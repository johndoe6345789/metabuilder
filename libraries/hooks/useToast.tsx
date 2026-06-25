'use client'

/**
 * useToast Hook
 * Standalone toast notification system with React context
 * Migrated from @metabuilder/fakemui for broader usage.
 *
 * Features:
 * - Multiple severity levels (success, error, warning, info)
 * - Auto-hide with configurable duration
 * - Maximum toast limit
 * - Deduplication by key
 * - Customizable anchor position
 * - Built-in styled toast renderer
 *
 * @example
 * // Wrap your app with ToastProvider
 * <ToastProvider maxToasts={5}>
 *   <App />
 * </ToastProvider>
 *
 * // Use in components
 * const { toast, success, error, warning, info, close, closeAll } = useToast()
 *
 * // Simple usage
 * toast('Hello world')
 *
 * // With severity helpers
 * success('Operation completed!')
 * error('Something went wrong')
 *
 * // With full options
 * toast({
 *   message: 'Custom toast',
 *   severity: 'warning',
 *   autoHideDuration: 3000,
 *   action: <button onClick={() => {}}>Undo</button>
 * })
 */

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

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

export interface ToastContextValue {
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

export interface ToastProviderProps {
  children: React.ReactNode
  /** Default auto hide duration in ms */
  defaultAutoHideDuration?: number
  /** Maximum number of toasts to show at once */
  maxToasts?: number
  /** Default anchor position */
  defaultAnchorOrigin?: ToastOptions['anchorOrigin']
  /** Custom toast renderer (optional) */
  renderToast?: (toast: Toast, onClose: () => void) => React.ReactNode
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | null>(null)

let toastIdCounter = 0
const generateId = () => `toast-${++toastIdCounter}`

// ============================================================================
// Default Styled Toast Component
// ============================================================================

const severityColors: Record<ToastSeverity, { bg: string; border: string; text: string }> = {
  success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724' },
  error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24' },
  warning: { bg: '#fff3cd', border: '#ffeeba', text: '#856404' },
  info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460' },
}

const positionStyles: Record<string, React.CSSProperties> = {
  'top-left': { top: 16, left: 16 },
  'top-center': { top: 16, left: '50%', transform: 'translateX(-50%)' },
  'top-right': { top: 16, right: 16 },
  'bottom-left': { bottom: 16, left: 16 },
  'bottom-center': { bottom: 16, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right': { bottom: 16, right: 16 },
}

interface DefaultToastProps {
  toast: Toast
  onClose: () => void
}

const DefaultToast: React.FC<DefaultToastProps> = ({ toast, onClose }) => {
  const colors = severityColors[toast.severity]
  const positionKey = `${toast.anchorOrigin.vertical}-${toast.anchorOrigin.horizontal}`
  const position = positionStyles[positionKey] || positionStyles['bottom-left']

  return (
    <div
      role="alert"
      aria-live={toast.severity === 'error' ? 'assertive' : 'polite'}
      style={{
        position: 'fixed',
        ...position,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 14,
        lineHeight: 1.4,
        maxWidth: 400,
        minWidth: 200,
      }}
    >
      <span style={{ flex: 1 }}>{toast.message}</span>
      {toast.action && <div style={{ marginLeft: 8 }}>{toast.action}</div>}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        style={{
          background: 'none',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          color: colors.text,
          opacity: 0.7,
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        &times;
      </button>
    </div>
  )
}

// ============================================================================
// Provider Component
// ============================================================================

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  defaultAutoHideDuration = 5000,
  maxToasts = 3,
  defaultAnchorOrigin = { vertical: 'bottom', horizontal: 'left' },
  renderToast,
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
      const t = prev.find(item => item.id === id)
      if (t?.onClose) {
        t.onClose()
      }
      return prev.filter(item => item.id !== id)
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
        renderToast ? (
          <React.Fragment key={t.id}>{renderToast(t, () => close(t.id))}</React.Fragment>
        ) : (
          <DefaultToast key={t.id} toast={t} onClose={() => close(t.id)} />
        )
      ))}
    </ToastContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access toast notifications
 *
 * @throws {Error} If used outside of ToastProvider
 *
 * @example
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
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastProvider
