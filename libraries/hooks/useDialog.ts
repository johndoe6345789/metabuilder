/**
 * useDialog Hook
 * Simple dialog/modal state management
 *
 * @example
 * const dialog = useDialog()
 * <Button onClick={dialog.open}>Open Dialog</Button>
 * <Dialog open={dialog.isOpen} onClose={dialog.close}>
 *   <DialogContent>...</DialogContent>
 * </Dialog>
 */

import { useState, useCallback } from 'react'

export interface UseDialogReturn {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Open the dialog */
  open: () => void
  /** Close the dialog */
  close: () => void
  /** Toggle the dialog state */
  toggle: () => void
  /** Directly set the open state */
  setOpen: (open: boolean) => void
}

/**
 * Hook for managing dialog/modal open/close state
 * @param initialOpen - Initial open state (default: false)
 * @returns Object containing dialog state and control methods
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
