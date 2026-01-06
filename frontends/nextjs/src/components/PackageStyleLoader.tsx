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

export function PackageStyleLoader({ packages }: PackageStyleLoaderProps) {
  useEffect(() => {
    async function loadStyles() {
      // eslint-disable-next-line no-console
      console.log(`📦 Loading styles for ${packages.length} packages...`)

      const results = await Promise.all(
        packages.map(async (packageId) => {
          try {
            const css = await loadAndInjectStyles(packageId)
            // eslint-disable-next-line no-console
            console.log(`✓ ${packageId} (${css.length} bytes)`)
            return { packageId, success: true, size: css.length }
          } catch (error) {
            console.warn(`✗ ${packageId}:`, error)
            return { packageId, success: false, size: 0 }
          }
        })
      )

      const successful = results.filter(r => r.success)
      const totalSize = successful.reduce((sum, r) => sum + r.size, 0)
      // eslint-disable-next-line no-console
      console.log(`✅ ${successful.length}/${packages.length} packages loaded (${(totalSize / 1024).toFixed(1)}KB)`)
    }

    if (packages.length > 0) {
      loadStyles()
    }
  }, [packages])

  return null
}
