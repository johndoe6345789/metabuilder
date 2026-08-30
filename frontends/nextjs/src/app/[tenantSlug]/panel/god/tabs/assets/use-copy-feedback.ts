'use client'

import { useCallback, useRef, useState } from 'react'

const FEEDBACK_MS = 1600

/**
 * Copies text to the clipboard and remembers which key to show "Copied"
 * next to, for a moment.
 */
export function useCopyFeedback() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback((key: string, text: string) => {
    void navigator.clipboard.writeText(text)
    setCopiedKey(key)
    if (timer.current !== null) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopiedKey(current => (current === key ? null : current))
    }, FEEDBACK_MS)
  }, [])

  return { copiedKey, copy }
}
