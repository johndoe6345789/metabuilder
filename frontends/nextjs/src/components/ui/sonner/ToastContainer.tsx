'use client'

import { Alert, Box, Snackbar } from 'fakemui'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { anchorFromPosition, containerPlacement, type Toast, type ToastOptions } from './config'
import styles from './ToastContainer.module.scss'

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

function getPositionClass(position: string): string {
  switch (position) {
    case 'top-left':
      return styles.topLeft
    case 'top-center':
      return styles.topCenter
    case 'top-right':
      return styles.topRight
    case 'bottom-left':
      return styles.bottomLeft
    case 'bottom-center':
      return styles.bottomCenter
    case 'bottom-right':
    default:
      return styles.bottomRight
  }
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
  const positionClass = useMemo(() => getPositionClass(position), [position])

  return (
    <Box className={`${styles.toastContainer} ${positionClass}`}>
      {toasts.map(t => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={t.duration || null}
          onClose={() => removeToast(t.id)}
          anchorOrigin={anchorOrigin}
          className={styles.snackbar}
        >
          <Alert
            severity={t.type === 'default' ? 'info' : t.type}
            variant={richColors ? 'filled' : 'standard'}
            onClose={closeButton ? () => removeToast(t.id) : undefined}
            className={`${styles.alert} ${expand ? styles.fullWidth : ''}`}
          >
            {t.message}
            {t.description && (
              <Box component="div" className={styles.alertDescription}>
                {t.description}
              </Box>
            )}
          </Alert>
        </Snackbar>
      ))}
    </Box>
  )
}
