'use client'

import { useEffect } from 'react'

const useCommandShortcut = (key: string, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === key) {
        event.preventDefault()
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [key, callback])
}

export { useCommandShortcut }
