import { useCallback, useState } from 'react'

export function usePatch<T extends Record<string, any>>(initial: T) {
  const [state, setState] = useState(initial)
  const patch = useCallback((partial: Partial<T>) => setState(s => ({ ...s, ...partial })), [])
  return [state, patch] as const
}
