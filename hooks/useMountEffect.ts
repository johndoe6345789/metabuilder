import { useEffect } from 'react'

export function useMountEffect(callback: () => void) {
  useEffect(callback, [])
}

export function useUnmountEffect(callback: () => void) {
  useEffect(() => callback, [])
}
