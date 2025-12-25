'use client'

/**
 * Sonner-compatible toast API using MUI Snackbar
 * Provides a drop-in replacement for the 'sonner' package
 * 
 * Usage:
 *   import { toast } from '@/components/ui/sonner'
 *   toast.success('Saved!')
 *   toast.error('Failed to save')
 *   toast('Default message')
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { Snackbar, Alert, type AlertColor, Box } from '@mui/material'

// Types
export interface ToastOptions {
  description?: string
  duration?: number
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  id?: string | number
}

interface Toast {
  id: string | number
  message: string
  description?: string
  type: AlertColor | 'default'
  duration: number
}

interface ToastContextValue {
  addToast: (toast: Toast) => void
  removeToast: (id: string | number) => void
}

// Context
const ToastContext = createContext<ToastContextValue | null>(null)

// Global toast queue for when called outside provider
let globalAddToast: ((toast: Toast) => void) | null = null
let toastIdCounter = 0

const generateId = () => `toast-${++toastIdCounter}`

/**
 * Creates a toast message
 */
const createToast = (message: string, type: AlertColor | 'default', options?: ToastOptions): Toast => ({
  id: options?.id ?? generateId(),
  message,
  description: options?.description,
  type,
  duration: options?.duration ?? 4000,
})

/**
 * Toast API - Sonner-compatible interface
 */
export const toast = Object.assign(
  (message: string, options?: ToastOptions) => {
    const t = createToast(message, 'default', options)
    globalAddToast?.(t)
    return t.id
  },
  {
    success: (message: string, options?: ToastOptions) => {
      const t = createToast(message, 'success', options)
      globalAddToast?.(t)
      return t.id
    },
    error: (message: string, options?: ToastOptions) => {
      const t = createToast(message, 'error', options)
      globalAddToast?.(t)
      return t.id
    },
    warning: (message: string, options?: ToastOptions) => {
      const t = createToast(message, 'warning', options)
      globalAddToast?.(t)
      return t.id
    },
    info: (message: string, options?: ToastOptions) => {
      const t = createToast(message, 'info', options)
      globalAddToast?.(t)
      return t.id
    },
    loading: (message: string, options?: ToastOptions) => {
      const t = createToast(message, 'info', { ...options, duration: 0 })
      globalAddToast?.(t)
      return t.id
    },
    dismiss: (id?: string | number) => {
      // TODO: Implement dismiss by ID
      console.log('Toast dismiss called', id)
    },
    promise: async <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: unknown) => string)
      },
      options?: ToastOptions
    ): Promise<T> => {
      const id = toast.loading(messages.loading, options)
      try {
        const result = await promise
        toast.dismiss(id)
        const successMessage = typeof messages.success === 'function' 
          ? messages.success(result) 
          : messages.success
        toast.success(successMessage, options)
        return result
      } catch (error) {
        toast.dismiss(id)
        const errorMessage = typeof messages.error === 'function'
          ? messages.error(error)
          : messages.error
        toast.error(errorMessage, options)
        throw error
      }
    },
  }
)

/**
 * Toaster component - Renders toast notifications
 * Place this at the root of your app (in layout.tsx)
 */
export function Toaster({ 
  position = 'bottom-right',
  richColors = false,
  expand = false,
  closeButton = false,
}: {
  position?: ToastOptions['position']
  richColors?: boolean
  expand?: boolean
  closeButton?: boolean
}) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast])
  }, [])

  const removeToast = useCallback((id: string | number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Register global handler
  useEffect(() => {
    globalAddToast = addToast
    return () => {
      globalAddToast = null
    }
  }, [addToast])

  // Map position to MUI anchor origin
  const getAnchorOrigin = () => {
    const vertical = position?.startsWith('top') ? 'top' : 'bottom'
    const horizontal = position?.includes('left') ? 'left' : position?.includes('center') ? 'center' : 'right'
    return { vertical, horizontal } as const
  }

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      <Box
        sx={{
          position: 'fixed',
          zIndex: 9999,
          ...(position?.includes('top') ? { top: 16 } : { bottom: 16 }),
          ...(position?.includes('left') ? { left: 16 } : position?.includes('center') ? { left: '50%', transform: 'translateX(-50%)' } : { right: 16 }),
        }}
      >
        {toasts.map((t, index) => (
          <Snackbar
            key={t.id}
            open
            autoHideDuration={t.duration || null}
            onClose={() => removeToast(t.id)}
            anchorOrigin={getAnchorOrigin()}
            sx={{ 
              position: 'relative',
              mb: 1,
            }}
          >
            <Alert
              severity={t.type === 'default' ? 'info' : t.type}
              variant={richColors ? 'filled' : 'standard'}
              onClose={closeButton ? () => removeToast(t.id) : undefined}
              sx={{ width: '100%', minWidth: 300 }}
            >
              {t.message}
              {t.description && (
                <Box component="div" sx={{ fontSize: '0.875rem', opacity: 0.8, mt: 0.5 }}>
                  {t.description}
                </Box>
              )}
            </Alert>
          </Snackbar>
        ))}
      </Box>
    </ToastContext.Provider>
  )
}

/**
 * Hook to access toast context
 */
export function useToast() {
  const context = useContext(ToastContext)
  return {
    toast,
    ...(context ?? { addToast: () => {}, removeToast: () => {} }),
  }
}

// Default export for sonner compatibility
export default toast
