import type { Preview } from '@storybook/react'
import React, { useEffect } from 'react'

import '../src/styles/globals.scss'
import { loadAndInjectStyles } from '../src/styles/compiler'

// Auto-load styles from common packages
const PACKAGES_TO_LOAD = [
  'shared',
  'ui_home',
  'ui_header',
  'ui_footer',
  'ui_level2',
  'ui_level3',
  'ui_level4',
]

// Load styles on Storybook initialization
if (typeof window !== 'undefined') {
  Promise.all(
    PACKAGES_TO_LOAD.map(async (packageId) => {
      try {
        const css = await loadAndInjectStyles(packageId)
        console.log(`✓ Loaded styles for ${packageId} (${css.length} bytes)`)
      } catch (error) {
        console.warn(`✗ Failed to load styles for ${packageId}:`, error)
      }
    })
  ).then(() => {
    console.log('📦 All package styles loaded')
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
      // Load story-specific package styles
      useEffect(() => {
        const storyPackage = (Story as any)?.parameters?.package
        if (storyPackage && !PACKAGES_TO_LOAD.includes(storyPackage)) {
          loadAndInjectStyles(storyPackage).then((css) => {
            console.log(`✓ Loaded story-specific styles for ${storyPackage}`)
          })
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
