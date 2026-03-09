import { useState, useEffect } from 'react'

export function useLastSaved(dependencies: any[]) {
  const [lastSaved, setLastSaved] = useState<number | null>(Date.now())

  useEffect(() => {
    setLastSaved(Date.now())
  }, dependencies)

  return lastSaved
}
