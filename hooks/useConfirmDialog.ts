/**
 * useConfirmDialog Hook
 * Promise-based confirmation dialog state management
 *
 * @example
 * const confirmDialog = useConfirmDialog()
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirmDialog.confirm({
 *     title: 'Delete Item',
 *     description: 'Are you sure you want to delete this item?',
 *     confirmText: 'Delete',
 *     variant: 'destructive'
 *   })
 *   if (confirmed) {
 *     // Perform delete
 *   }
 * }
 *
 * // Render the dialog
 * <ConfirmDialog
 *   open={confirmDialog.isOpen}
 *   options={confirmDialog.options}
 *   onConfirm={confirmDialog.handleConfirm}
 *   onCancel={confirmDialog.handleCancel}
 * />
 */

import { useState, useCallback } from 'react'

export interface ConfirmDialogOptions {
  /** Dialog title */
  title: string
  /** Dialog description/message */
  description: string
  /** Text for confirm button (default: 'Confirm') */
  confirmText?: string
  /** Text for cancel button (default: 'Cancel') */
  cancelText?: string
  /** Button variant style */
  variant?: 'default' | 'destructive'
}

export interface ConfirmDialogState {
  isOpen: boolean
  options: ConfirmDialogOptions | null
  resolve: ((value: boolean) => void) | null
}

export interface UseConfirmDialogReturn {
  /** Whether the dialog is currently open */
  isOpen: boolean
  /** Current dialog options */
  options: ConfirmDialogOptions | null
  /** Show confirmation dialog and return promise that resolves to user's choice */
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>
  /** Handle confirm button click */
  handleConfirm: () => void
  /** Handle cancel button click */
  handleCancel: () => void
}

/**
 * Hook for managing promise-based confirmation dialogs
 * @returns Object containing dialog state and control methods
 */
export function useConfirmDialog(): UseConfirmDialogReturn {
  const [state, setState] = useState<ConfirmDialogState>({
    isOpen: false,
    options: null,
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmDialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirm = useCallback(() => {
    if (state.resolve) {
      state.resolve(true)
    }
    setState({ isOpen: false, options: null, resolve: null })
  }, [state.resolve])

  const handleCancel = useCallback(() => {
    if (state.resolve) {
      state.resolve(false)
    }
    setState({ isOpen: false, options: null, resolve: null })
  }, [state.resolve])

  return {
    isOpen: state.isOpen,
    options: state.options,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
