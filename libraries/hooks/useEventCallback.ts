import { useCallback, useRef, useEffect } from 'react'

export function useEventCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback)
  useEffect(() => { callbackRef.current = callback }, [callback])
  return useCallback((...args: any[]) => callbackRef.current(...args), []) as T
}
