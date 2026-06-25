import { useState } from 'react'

export function useDialogState(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  const toggle = () => setIsOpen(prev => !prev)

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  }
}

export function useMultipleDialogs() {
  const [dialogs, setDialogs] = useState<Record<string, boolean>>({})

  const openDialog = (name: string) => {
    setDialogs(prev => ({ ...prev, [name]: true }))
  }

  const closeDialog = (name: string) => {
    setDialogs(prev => ({ ...prev, [name]: false }))
  }

  const toggleDialog = (name: string) => {
    setDialogs(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const isDialogOpen = (name: string) => dialogs[name] || false

  return {
    dialogs,
    openDialog,
    closeDialog,
    toggleDialog,
    isDialogOpen,
  }
}
