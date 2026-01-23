import { useEffect, useRef, useCallback } from 'react'

export function useTimeout(callback: () => void, delay: number | null) {
  const idRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (delay === null) return
    idRef.current = setTimeout(callback, delay)
    return () => {
      if (idRef.current) clearTimeout(idRef.current)
    }
  }, [callback, delay])

  const clear = useCallback(() => {
    if (idRef.current) {
      clearTimeout(idRef.current)
      idRef.current = null
    }
  }, [])

  return clear
}
