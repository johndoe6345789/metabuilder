'use client'

/**
 * Package Style Loader
 *
 * Dynamically loads and injects V2 schema styles from packages
 */

import { useEffect } from 'react'
import { loadAndInjectStyles } from '@/lib/compiler'

interface PackageStyleLoaderProps {
  packages: string[]
}

export function PackageStyleLoader({ packages }: PackageStyleLoaderProps): null {
  useEffect(() => {
    async function loadStyles(): Promise<void> {
      const results = await Promise.all(
        packages.map(async (packageId) => {
          try {
            const css = await loadAndInjectStyles(packageId)
            return { packageId, success: true, size: css.length }
          } catch {
            return { packageId, success: false, size: 0 }
          }
        })
      )

      // Log summary in development only
      if (process.env.NODE_ENV === 'development') {
        const successful = results.filter(r => r.success)
        const totalSize = successful.reduce((sum, r) => sum + r.size, 0)
        // eslint-disable-next-line no-console
        console.log(`[PackageStyleLoader] ${successful.length}/${packages.length} packages (${(totalSize / 1024).toFixed(1)}KB)`)
      }
    }

    if (packages.length > 0) {
      void loadStyles()
    }
  }, [packages])

  return null
}
