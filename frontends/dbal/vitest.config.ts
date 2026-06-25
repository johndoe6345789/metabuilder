import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: ['src/**/*'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
        'src/**/*.module.scss',
        'src/**/test-setup.ts',
        // Exclude pure data/type files from threshold calculations
        'src/data/**',
        // Exclude Next.js-specific pages and layouts that require app router context
        'src/DaemonPage.tsx',
        'src/NavTabs.tsx',
        'src/ServerStatusPanel.tsx',
        'src/status.ts',
        'src/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') },
    ],
  },
})
