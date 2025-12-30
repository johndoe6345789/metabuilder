import React, { useState, useEffect } from 'react'

/**
 * NoSsr - Defers rendering of children until after mount (client-side only)
 * Useful for components that rely on browser APIs
 */
export function NoSsr({
  children,
  defer = false,
  fallback = null,
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (defer) {
      // Use requestIdleCallback if available, otherwise setTimeout
      const id = typeof requestIdleCallback !== 'undefined'
        ? requestIdleCallback(() => setMounted(true))
        : setTimeout(() => setMounted(true), 0)

      return () => {
        if (typeof cancelIdleCallback !== 'undefined') {
          cancelIdleCallback(id)
        } else {
          clearTimeout(id)
        }
      }
    } else {
      setMounted(true)
    }
  }, [defer])

  return mounted ? <>{children}</> : <>{fallback}</>
}

export default NoSsr
