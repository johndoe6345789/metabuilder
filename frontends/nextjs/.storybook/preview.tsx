import type { Preview } from '@storybook/react'
import React from 'react'

// Import global styles
import '../src/app/globals.scss'

// Create a mock context provider for Storybook
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Default viewport
    viewport: {
      defaultViewport: 'desktop',
    },
    // Background options
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
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
}

export default preview
