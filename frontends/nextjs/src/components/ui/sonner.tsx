'use client'

/**
 * Sonner-compatible toast API using MUI Snackbar
 * Provides a drop-in replacement for the 'sonner' package.
 *
 * Usage:
 *
 * ```tsx
 * import { Toaster, toast } from '@/components/ui/sonner'
 *
 * function App() {
 *   return (
 *     <>
 *       <button onClick={() => toast('Default message')}>Show default toast</button>
 *       <button onClick={() => toast.success('Saved!')}>Show success toast</button>
 *       <button onClick={() => toast.error('Failed to save')}>Show error toast</button>
 *       <Toaster />
 *     </>
 *   )
 * }
 * ```
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { ToastContainer, type ToastHandlers } from './sonner/ToastContainer'
import {
  DEFAULT_DURATION,
  type Toast,
  type ToastOptions,
  type ToastType,
} from './sonner/config'

const ToastContext = createContext<ToastHandlers>({
  addToast: () => {},
  removeToast: () => {},
})

let globalAddToast: ((toast: Toast) => void) | null = null
let globalRemoveToast: ((id?: string | number) => void) | null = null
let toastIdCounter = 0

const generateId = () => `toast-${++toastIdCounter}`

const createToast = (message: string, type: ToastType, options?: ToastOptions): Toast => ({
  id: options?.id ?? generateId(),
  message,
  description: options?.description,
  type,
  duration: options?.duration ?? DEFAULT_DURATION,
})

const enqueueToast = (toast: Toast) => {
  globalAddToast?.(toast)
  return toast.id
}

export const toast = Object.assign(
  (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'default', options)),
  {
    success: (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'success', options)),
    error: (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'error', options)),
    warning: (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'warning', options)),
    info: (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'info', options)),
    loading: (message: string, options?: ToastOptions) => enqueueToast(createToast(message, 'info', { ...options, duration: 0 })),
    dismiss: (id?: string | number) => {
      globalRemoveToast?.(id)
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
        const successMessage = typeof messages.success === 'function' ? messages.success(result) : messages.success
        toast.success(successMessage, options)
        return result
      } catch (error) {
        toast.dismiss(id)
        const errorMessage = typeof messages.error === 'function' ? messages.error(error) : messages.error
        toast.error(errorMessage, options)
        throw error
      }
    },
  }
)

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
  const [handlers, setHandlers] = useState<ToastHandlers>({
    addToast: () => {},
    removeToast: () => {},
  })

  useEffect(() => {
    return () => {
      globalAddToast = null
      globalRemoveToast = null
    }
  }, [])

  const registerHandlers = useCallback((nextHandlers: ToastHandlers) => {
    setHandlers(nextHandlers)
    globalAddToast = nextHandlers.addToast
    globalRemoveToast = nextHandlers.removeToast
  }, [])

  return (
    <ToastContext.Provider value={handlers}>
      <ToastContainer
        position={position}
        richColors={richColors}
        expand={expand}
        closeButton={closeButton}
        onRegister={registerHandlers}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  return { toast, ...context }
}

export default toast
