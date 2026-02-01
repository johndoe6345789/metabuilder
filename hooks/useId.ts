import { useMemo } from 'react'

export function useId(prefix = 'id') {
  return useMemo(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`, [prefix])
}
