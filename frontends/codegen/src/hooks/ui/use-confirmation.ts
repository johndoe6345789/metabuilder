import { useState, useCallback } from 'react'

interface ConfirmationState {
  open: boolean
  title: string
  description: string
  onConfirm: () => void
  onCancel?: () => void
}

export function useConfirmation() {
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
