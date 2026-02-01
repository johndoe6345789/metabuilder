import { useCallback, useState } from 'react'

export function useRefresh() {
  const [, refresh] = useState({})
  return useCallback(() => refresh({}), [])
}
