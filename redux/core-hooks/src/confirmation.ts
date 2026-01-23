/**
 * useConfirmation Hook
 * Confirmation dialog with title/description and callbacks
 */

import { useState, useCallback } from 'react'

interface ConfirmationState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
}

export interface UseConfirmationReturn {
  state: ConfirmationState
  confirm: (title: string, description: string, onConfirm: () => void, onCancel?: () => void) => void
  handleConfirm: () => void
  handleCancel: () => void
}

/**
 * Manages confirmation dialog state
 */
export function useConfirmation(): UseConfirmationReturn {
  const [state, setState] = useState<ConfirmationState>({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  })

  const confirm = useCallback(
    (
      title: string,
      description: string,
      onConfirm: () => void,
      onCancel?: () => void
    ) => {
      setState({
        open: true,
        title,
        description,
        onConfirm,
        onCancel,
      })
    },
    []
  )

  const handleConfirm = useCallback(() => {
    state.onConfirm()
    setState((prev) => ({ ...prev, open: false }))
  }, [state])

  const handleCancel = useCallback(() => {
    state.onCancel?.()
    setState((prev) => ({ ...prev, open: false }))
  }, [state])

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
