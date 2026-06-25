import { useState } from 'react'

export function useImageState(onLoad?: () => void, onError?: () => void) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setLoading(false)
    onError?.()
  }

  return {
    error,
    loading,
    handleLoad,
    handleError,
  }
}
