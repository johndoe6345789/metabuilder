import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export function useClipboard() {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async (text: string, message?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(message || 'Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
      return true
    } catch (error) {
      toast.error('Failed to copy to clipboard')
      return false
    }
  }, [])

  const paste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      return text
    } catch (error) {
      toast.error('Failed to read from clipboard')
      return null
    }
  }, [])

  return { copy, paste, copied }
}
