import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  staticDirs: [
    // Serve JSON packages from root
    { from: '../../packages', to: '/packages' },
    // Serve schemas for validation
    { from: '../../schemas', to: '/schemas' },
    // Serve public folder
    { from: '../public', to: '/' },
  ],
  async viteFinal(config) {
    return mergeConfig(config, {
      base: '/storybook/',
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '../src'),
          '@packages': path.resolve(__dirname, '../../packages'),
        },
      },
    })
  },
}

export default config
