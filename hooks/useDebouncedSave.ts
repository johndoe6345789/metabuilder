/**
 * useDebouncedSave Hook
 * Automatically save data after a debounce delay
 *
 * @example
 * const [content, setContent] = useState('')
 *
 * useDebouncedSave(content, async (value) => {
 *   await api.saveDocument(value)
 * }, 1000) // Save 1 second after last change
 *
 * <textarea
 *   value={content}
 *   onChange={(e) => setContent(e.target.value)}
 * />
 */

import { useEffect, useRef } from 'react'

/**
 * Hook that debounces save operations
 * @param value - Value to watch for changes
 * @param onSave - Callback to save the value
 * @param delay - Debounce delay in milliseconds (default: 1000)
 */
export function useDebouncedSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 1000
): void {
  const timeoutRef = useRef<number>(0)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      onSave(value)
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, onSave, delay])
}
