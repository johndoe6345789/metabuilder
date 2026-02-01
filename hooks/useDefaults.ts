import { useMemo } from 'react'

export function useDefaults<T extends Record<string, any>>(value: Partial<T>, defaults: T): T {
  return useMemo(() => ({ ...defaults, ...value }), [value, defaults])
}
