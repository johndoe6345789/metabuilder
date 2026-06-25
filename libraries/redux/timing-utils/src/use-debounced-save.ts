import { useEffect, useRef } from 'react'

/**
 * Debounces a save operation, triggering it after a value hasn't changed for a specified duration.
 * Useful for auto-saving form data, editor content, or other user input without overwhelming the API.
 *
 * @example
 * function CodeEditor() {
 *   const [code, setCode] = useState('')
 *   const [isSaving, setIsSaving] = useState(false)
 *
 *   const handleSave = async (value: string) => {
 *     setIsSaving(true)
 *     try {
 *       await saveToAPI(value)
 *     } finally {
 *       setIsSaving(false)
 *     }
 *   }
 *
 *   useDebouncedSave(code, handleSave, 1500)
 *
 *   return (
 *     <>
 *       <textarea
 *         value={code}
 *         onChange={(e) => setCode(e.target.value)}
 *       />
 *       {isSaving && <span>Saving...</span>}
 *     </>
 *   )
 * }
 */
export function useDebouncedSave<T>(
  value: T,
  onSave: (value: T) => void,
  delay: number = 1000
) {
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
