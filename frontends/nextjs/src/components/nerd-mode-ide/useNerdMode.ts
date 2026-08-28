'use client'

import { useState, useCallback } from 'react'

function readStorage(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem('nerd-mode-enabled') === 'true'
}

export function useNerdMode() {
  const [isOpen, setIsOpen] = useState<boolean>(readStorage)

  const open = useCallback(() => {
    setIsOpen(true)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nerd-mode-enabled', 'true')
    }
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('nerd-mode-enabled', 'false')
    }
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      const next = !prev
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('nerd-mode-enabled', String(next))
      }
      return next
    })
  }, [])

  return { isOpen, open, close, toggle }
}
