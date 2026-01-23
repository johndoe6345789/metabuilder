/**
 * useCopyState Hook
 * Copy-to-clipboard with state feedback
 */

import { useState } from 'react'

export interface UseCopyStateReturn {
  copied: boolean
  setCopied: (copied: boolean) => void
  handleCopy: () => Promise<void>
}

/**
 * Manages copy-to-clipboard state
 * @param text - Text to copy
 */
export function useCopyState(text: string): UseCopyStateReturn {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  return {
    copied,
    setCopied,
    handleCopy,
  }
}
