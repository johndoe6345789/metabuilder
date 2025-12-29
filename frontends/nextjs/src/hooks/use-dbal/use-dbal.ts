import { useEffect, useState } from 'react'

import { dbal } from '@/lib/dbal-integration'

/**
 * Hook to ensure DBAL is initialized
 */
export function useDBAL() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        if (!dbal.isInitialized()) {
          await dbal.initialize()
        }
        setIsReady(true)
      } catch (err) {
        const errorInfo = dbal.handleError(err)
        setError(errorInfo.message)
        console.error('DBAL initialization failed:', err)
      }
    }

    init()
  }, [])

  return { isReady, error }
}
