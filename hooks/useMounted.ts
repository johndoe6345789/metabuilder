import { useEffect, useRef } from 'react'

export function useMounted() {
  const isMounted = useRef(false)
  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])
  return isMounted.current
}
