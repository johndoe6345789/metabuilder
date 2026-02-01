import { useRef, useCallback } from 'react'

export function useFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const focus = useCallback(() => ref.current?.focus(), [])
  return { ref, focus }
}
