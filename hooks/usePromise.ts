import { useState, useEffect } from 'react'

export function usePromise<T>(promise: Promise<T> | null) {
  const [result, setResult] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(!!promise)

  useEffect(() => {
    if (!promise) return
    promise.then(setResult).catch(setError).finally(() => setLoading(false))
  }, [promise])

  return { result, error, loading }
}
