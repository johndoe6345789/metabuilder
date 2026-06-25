import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/.git/**',
      // Pre-existing tests with unresolvable deps in vitest
      'src/lib/json-ui/__tests__/**',
      'src/lib/unified-storage-adapters/__tests__/**',
      'src/lib/unified-storage.test.ts',
      'src/store/middleware/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      include: [
        // Generators (all tested)
        'src/lib/generators/**/*.ts',
        // Docker-parser utilities (all tested)
        'src/lib/docker-parser/**/*.ts',
        // Core lib utilities
        'src/lib/utils.ts',
        // Redux slices (all tested)
        'src/store/slices/**/*.ts',
        // Hooks tested directly (no complex deps)
        'src/hooks/ui/use-tabs.ts',
        'src/hooks/ui/use-confirmation.ts',
        'src/hooks/ui/use-form-state.ts',
        'src/hooks/ui/use-list-operations.ts',
        'src/hooks/ui/use-selection.ts',
        'src/hooks/data/use-search-filter.ts',
        'src/hooks/data/use-selection.ts',
        'src/hooks/use-save-indicator.ts',
        // search-filter hook
        'src/hooks/data/use-search-filter.ts',
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/__tests__/**',
        // Slice with complex deps outside scope
        'src/store/slices/dbalSlice.ts',
        'src/store/slices/testsSlice.ts',
      ],
      all: false,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom'],
        },
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [{ find: /^@\/(.+)$/, replacement: resolve(__dirname, './src/$1') }],
  },
})
