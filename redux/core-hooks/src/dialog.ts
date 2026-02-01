/**
 * useDialog Hook
 * Generic dialog state management with open/close/toggle functionality
 */

import { useState, useCallback } from 'react'

export interface UseDialogReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  setOpen: (open: boolean) => void
}

/**
 * Manages dialog open/closed state
 * @param initialOpen - Initial open state (default: false)
 */
export function useDialog(initialOpen = false): UseDialogReturn {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen: setIsOpen,
  }
}
