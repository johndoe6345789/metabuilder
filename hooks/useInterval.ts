import { useEffect, useRef } from 'react'

export function useInterval(callback: () => void, delay: number | null) {
  const idRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (delay === null) return
    idRef.current = setInterval(callback, delay)
    return () => {
      if (idRef.current) clearInterval(idRef.current)
    }
  }, [callback, delay])
}
