import { useState, useCallback } from 'react'
import { toast } from 'sonner'

export function useClipboard(successMessage?: string) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        if (successMessage) {
          toast.success(successMessage)
        }
        setTimeout(() => setCopied(false), 2000)
        return true
      } catch (error) {
        console.error('Failed to copy:', error)
        toast.error('Failed to copy to clipboard')
        return false
      }
    },
    [successMessage]
  )

  return {
    copied,
    copy,
  }
}
