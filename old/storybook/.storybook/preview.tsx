import type { Preview } from '@storybook/react'
import React, { useEffect } from 'react'

import '../src/styles/globals.scss'
import { loadAndInjectStyles } from '../src/styles/compiler'
import { discoverPackagesWithStyles } from '../src/utils/packageDiscovery'

// Dynamically load all package styles
if (typeof window !== 'undefined') {
  discoverPackagesWithStyles()
    .then((packageIds) => {
      console.log(`📦 Discovered ${packageIds.length} packages with styles:`, packageIds)
      return Promise.all(
        packageIds.map(async (packageId) => {
          try {
            const css = await loadAndInjectStyles(packageId)
            console.log(`✓ ${packageId} (${css.length} bytes)`)
            return { packageId, success: true, size: css.length }
          } catch (error) {
            console.warn(`✗ ${packageId}:`, error)
            return { packageId, success: false, size: 0 }
          }
        })
      )
    })
    .then((results) => {
      const successful = results.filter(r => r.success)
      const totalSize = successful.reduce((sum, r) => sum + r.size, 0)
      console.log(`✅ ${successful.length} packages loaded (${(totalSize / 1024).toFixed(1)}KB)`)
    })
    .catch((error) => {
      console.error('❌ Discovery failed:', error)
    })
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a2e' },
        { name: 'canvas', value: '#f5f5f5' },
      ],
    },
  },
  decorators: [
    (Story) => {
      // Load story-specific package styles on demand
      useEffect(() => {
        const storyPackage = (Story as any)?.parameters?.package
        if (storyPackage) {
          // Check if already loaded
          const existingStyle = document.getElementById(`styles-${storyPackage}`)
          if (!existingStyle) {
            loadAndInjectStyles(storyPackage).then((css) => {
              console.log(`✓ Story-specific: ${storyPackage} (${css.length} bytes)`)
            }).catch((error) => {
              console.warn(`✗ Story-specific ${storyPackage}:`, error)
            })
          }
        }
      }, [])

      return (
        <div style={{ padding: '1rem' }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
