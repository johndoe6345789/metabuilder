import { useEffect, useRef } from 'react'

export function useFirstEffect(effect: () => void) {
  const isFirstRef = useRef(true)
  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false
      effect()
    }
  }, [effect])
}
