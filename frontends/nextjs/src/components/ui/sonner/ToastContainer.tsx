'use client'

import { Alert, Box, Snackbar } from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { anchorFromPosition, containerPlacement, type Toast, type ToastOptions } from './config'

export interface ToastHandlers {
  addToast: (toast: Toast) => void
  removeToast: (id?: string | number) => void
}

interface ToastContainerProps extends ToastOptions {
  richColors?: boolean
  expand?: boolean
  closeButton?: boolean
  onRegister?: (handlers: ToastHandlers) => void
}

export function ToastContainer({
  position = 'bottom-right',
  richColors = false,
  expand = false,
  closeButton = false,
  onRegister,
}: ToastContainerProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts(prev => [...prev, toast])
  }, [])

  const removeToast = useCallback((id?: string | number) => {
    if (typeof id === 'undefined') {
      setToasts([])
      return
    }
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  useEffect(() => {
    onRegister?.({ addToast, removeToast })
  }, [addToast, onRegister, removeToast])

  const anchorOrigin = useMemo(() => anchorFromPosition(position), [position])
  const containerPosition = useMemo(() => containerPlacement(position), [position])

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 9999,
        ...containerPosition,
      }}
    >
      {toasts.map(t => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={t.duration || null}
          onClose={() => removeToast(t.id)}
          anchorOrigin={anchorOrigin}
          sx={{
            position: 'relative',
            mb: 1,
          }}
        >
          <Alert
            severity={t.type === 'default' ? 'info' : t.type}
            variant={richColors ? 'filled' : 'standard'}
            onClose={closeButton ? () => removeToast(t.id) : undefined}
            sx={{ width: expand ? '100%' : 'auto', minWidth: 300 }}
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
  )
}
