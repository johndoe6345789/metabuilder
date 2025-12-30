import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import path from 'path'

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    // Include Lua package stories
    '../src/storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {},
  staticDirs: [
    // Serve package static content
    { from: '../../packages', to: '/packages' },
  ],
  async viteFinal(config) {
    return mergeConfig(config, {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
      // Mock Node.js modules that aren't available in browser
      define: {
        'process.env': {},
      },
    })
  },
}

export default config
